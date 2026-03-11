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
        Sen son derece acımasız, kuralcı ve analitik bir İK Yöneticisisin. 
        Aşağıda sana bir 'Belge Metni' ve 'İş Tanımı' veriyorum.

        GÖREV 1 - SAHTEKARLIK KONTROLÜ (ÇOK ÖNEMLİ):
        Önce bu iki veriyi incele. 
        - Belge metni gerçekten bir CV mi? (İçinde eğitim, deneyim, yetenek gibi şeyler yoksa, boşsa veya alakasız bir metinse CV DEĞİLDİR).
        - İş Tanımı mantıklı mı? (Sadece 'asdasd', 'qweqwe' yazılmışsa veya saçmaysa GEÇERSİZDİR).

        EĞER BU VERİLERDEN BİRİ BİLE SAÇMAYSA VEYA CV DEĞİLSE, SADECE VE SADECE ŞU JSON'U DÖNDÜR:
        {{
            "is_valid": false,
            "error_message": "Sisteme anlamsız bir belge veya geçersiz bir iş tanımı yüklediniz. Lütfen geçerli bir CV PDF'i ve gerçek bir iş ilanı girerek tekrar deneyin."
        }}

        GÖREV 2 - HASSAS VE GERÇEKÇİ ANALİZ (SADECE VERİLER KUSURSUZSA):
        Eğer veriler geçerliyse, tam analiz yap. PUANLAMA (score) KONUSUNDA ÇOK HASSAS OL:
        - ASLA 80, 85, 90 gibi yuvarlak ve ezbere sayılar verme!
        - İş ilanındaki anahtar kelimeler ile CV'deki yetenekleri eşleştir. Deneyim yıllarını karşılaştır.
        - Sonucu kesinlikle matematiksel bir oran olarak hesapla. (Örneğin: 34, 47, 62, 73, 88, 91 gibi çok spesifik ve gerçekçi bir tamsayı olsun).
        
        SADECE şu formattaki JSON'u döndür:
        {{
            "is_valid": true,
            "score": 73, 
            "strengths": ["Güçlü yan 1", "Güçlü yan 2"],
            "weaknesses": ["Zayıf yan 1", "Zayıf yan 2"],
            "suggestions": ["Öneri 1", "Öneri 2"],
            "cover_letter": "Bu iş için adayın neden uygun olduğunu anlatan profesyonel önyazı."
        }}

        Belge Metni: {cv_text}
        
        İş Tanımı: {job_description}
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.2 # Biraz yaratıcılık ekledik ki matematiği daha iyi yapsın
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