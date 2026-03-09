import os
import io
import json
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import pdfplumber
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY") or "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")

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...), job_description: str = Form("")):
    try:
        contents = await file.read()
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])

        prompt = f"""
        Sen bir İK uzmanısın. Aşağıdaki CV'yi analiz et ve sonucu MUTLAKA şu JSON formatında döndür:
        {{
            "score": 0-100 arası bir sayı,
            "summary": "Kısa bir özet",
            "strengths": ["madde 1", "madde 2"],
            "weaknesses": ["madde 1", "madde 2"],
            "suggestions": ["iyileştirme 1", "iyileştirme 2"],
            "ats_keywords": ["anahtar kelime 1", "anahtar kelime 2"]
        }}

        CV Metni: {text}
        İş İlanı: {job_description if job_description else "Genel Analiz"}
        """

        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            response_format={ "type": "json_object" } # JSON döndürmesini zorunlu kılıyoruz
        )

        return json.loads(chat_completion.choices[0].message.content)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)