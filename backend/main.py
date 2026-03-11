from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import os
from groq import Groq
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.get("/")
def read_root():
    return {"message": "CV Analiz API Calisiyor!"}

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        pdf_reader = PyPDF2.PdfReader(file.file)
        cv_text = ""
        for page in pdf_reader.pages:
            cv_text += page.extract_text()

        prompt = f"""
        Sen duygusuz, tamamen matematiksel çalışan bir eşleştirme algoritmasısın. Kibar veya yapıcı olmak zorunda değilsin. Gerçek neyse onu rakamlara dök.

        KURAL 1 - GEÇERLİLİK KONTROLÜ:
        Eğer belge gerçek bir CV değilse (eğitim/deneyim içermiyorsa) veya iş tanımı anlamsızsa (örn: 'asdasd'), SADECE şunu döndür:
        {{
            "is_valid": false,
            "error_message": "Geçersiz belge veya iş ilanı."
        }}

        KURAL 2 - MATEMATİKSEL PUANLAMA (ÇOK ÖNEMLİ):
        Eğer veriler geçerliyse, "score" değerini şu katı algoritmaya göre hesapla:
        - SEKTÖR UYUMSUZLUĞU: CV'deki meslek ile İlandaki meslek tamamen alakasızsa (Örn: CV Yazılımcı, İlan Garson veya Doktor), SCORE KESİNLİKLE 5 ile 25 arasında olmalıdır!
        - YETENEK EKSİKLİĞİ: İlandaki anahtar kelimeler (örn: iOS, React, Pazarlama vb.) CV'de yoksa, her eksik kelime için puan kır. İstenenlerin hiçbiri yoksa score KESİNLİKLE 10 ile 30 arasında olmalıdır!
        - SADECE VE SADECE CV ile İlan %100 örtüşüyorsa 80 üzerine çıkabilirsin.
        - ASLA ezbere 80 veya 85 verme. Alakasız durumlarda acımasızca 12, 18, 24, 33 gibi puanlar ver.

        SONUÇ FORMATI (SADECE JSON):
        {{
            "is_valid": true,
            "score": [HESAPLADIĞIN_GERÇEK_MATEMATİKSEL_PUAN],
            "strengths": ["Eğer varsa 1-2 güçlü yan", "Yoksa 'İlanla eşleşen güçlü yan bulunamadı' yaz"],
            "weaknesses": ["Zayıf yan 1", "Zayıf yan 2"],
            "suggestions": ["Öneri 1", "Öneri 2"],
            "cover_letter": "Bu iş için adayın neden uygun olduğunu anlatan kısa profesyonel önyazı. (Eğer aday tamamen alakasızsa, 'Sayın İK Yöneticisi, bu pozisyon için gerekli temel yetkinliklere sahip olmasam da farklı alanlardaki tecrübelerimle değer katabileceğime inanıyorum...' gibi bir metin yaz)."
        }}

        Belge Metni: {cv_text}
        
        İş Tanımı: {job_description}
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.0 # DİKKAT: Yaratıcılığı SIFIR YAPTIK! Artık sadece kurala uyacak.
        )

        result_text = chat_completion.choices[0].message.content
        
        start_idx = result_text.find('{')
        end_idx = result_text.rfind('}') + 1
        if start_idx != -1 and end_idx != -1:
            json_str = result_text[start_idx:end_idx]
        else:
            json_str = result_text
            
        result = json.loads(json_str)
        return result
    except Exception as e:
        return {"error": str(e)}