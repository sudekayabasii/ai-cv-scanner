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
        Sen üst düzey ve çok katı bir İK uzmanısın. Aşağıdaki 'CV Metni' ve 'İş Tanımı'nı incele.
        
        ÖN KONTROL AŞAMASI:
        1. Kullanıcının yüklediği belge gerçekten bir CV/Özgeçmiş mi? (İçinde yemek tarifi, şarkı sözü, rastgele harfler vb. alakasız şeyler varsa direkt reddet).
        2. Kullanıcının girdiği 'İş Tanımı' gerçekten bir iş ilanı metni mi? (Sadece 'asdasd' yazılmışsa veya alakasız bir cümleyse reddet).
        
        EĞER BELGELERDEN BİRİ BİLE SAÇMA/GEÇERSİZ İSE SADECE ŞU JSON'U DÖNDÜR:
        {{
            "is_valid": false,
            "error_message": "Sisteme anlamsız bir belge veya geçersiz bir iş tanımı yüklediniz. Lütfen geçerli bir CV PDF'i ve gerçek bir iş ilanı girerek tekrar deneyin."
        }}

        EĞER HER İKİSİ DE GEÇERLİ VE MANTIKLIYSA TAM ANALİZ YAP VE SADECE ŞU JSON'U DÖNDÜR:
        {{
            "is_valid": true,
            "score": 85,
            "strengths": ["Güçlü yan 1", "Güçlü yan 2"],
            "weaknesses": ["Zayıf yan 1", "Zayıf yan 2"],
            "suggestions": ["Öneri 1", "Öneri 2"],
            "cover_letter": "Bu iş için adayın neden çok uygun olduğunu anlatan profesyonel önyazı."
        }}

        CV Metni: {cv_text}
        
        İş Tanımı: {job_description}
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama3-8b-8192",
            temperature=0.3
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