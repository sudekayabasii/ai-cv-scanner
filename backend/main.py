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

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...), job_description: str = Form(...)):
    try:
        api_key = os.environ.get("GROQ_API_KEY")
        client = Groq(api_key=api_key)

        # PDF Okuma
        pdf_reader = PyPDF2.PdfReader(file.file)
        cv_text = ""
        for page in pdf_reader.pages:
            cv_text += page.extract_text() or ""

        prompt = f"CV: {cv_text}\nİlan: {job_description}\nAnaliz et ve JSON döndür: {{'score': 0, 'strengths': [], 'weaknesses': [], 'suggestions': [], 'cover_letter': '', 'is_valid': true}}"

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.1
        )
        raw_content = chat_completion.choices[0].message.content
        
        # Yapay zekanın gevezeliğini atla, sadece { ile başlayıp } ile biten asıl veriyi bul
        start_index = raw_content.find('{')
        end_index = raw_content.rfind('}')
        
        if start_index != -1 and end_index != -1:
            cleaned_content = raw_content[start_index:end_index+1]
            result = json.loads(cleaned_content)
            return result
        else:
            # Eğer içinde hiç süslü parantez yoksa, yapay zekanın ne saçmaladığını bize göstersin!
            return {"error": "Yapay zeka geçerli bir format göndermedi.", "ai_gizli_cevap": raw_content}

    except Exception as e:
        return {"error": f"Sistem Hatası: {str(e)}", "ai_gizli_cevap": raw_content if 'raw_content' in locals() else "Bilinmiyor"}