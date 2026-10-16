const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate-lesson', async (req, res) => {
  try {
    const { level, domain, strand, title, duration, pedagogyType, studentLevel } = req.body;

    const prompt = `
أنت خبير بيداغوجي ومفتش تربوي لمادة الرياضيات في التعليم المتوسط بالجزائر.
قم بإعداد مذكرة تربوية احترافية باللغة العربية الفصحى وفق المناهج الرسمية الجزائرية بالمواصفات التالية:
- المستوى: ${level}
- الميدان: ${domain}
- المقطع التعليمي: ${strand}
- عنوان الدرس: ${title}
- مدة الحصة: ${duration}
- نوع الحصة: ${pedagogyType}
- مستوى التلاميذ: ${studentLevel}

يجب أن تكون النتيجة حصرياً بصيغة JSON صالحة للتحليل (Valid JSON) دون أي نصوص إضافية خارج هيكل الjson، وتحتوي على المفاتيح التالية باللغة العربية أو الإنجليزية بوضوح:
{
  "generalInfo": {
    "level": "${level}",
    "domain": "${domain}",
    "strand": "${strand}",
    "title": "${title}",
    "duration": "${duration}",
    "targetedCompetency": "...",
    "objectives": ["...", "..."],
    "prerequisites": ["...", "..."],
    "tools": ["...", "..."]
  },
  "launchPosition": {
    "problem": "...",
    "activityText": "...",
    "questions": ["...", "..."],
    "modelAnswer": "...",
    "transition": "..."
  },
  "lessonFlow": [
    {
      "phase": "...",
      "duration": "...",
      "teacherAction": "...",
      "studentAction": "...",
      "boardWork": "...",
      "notebookCopy": "...",
      "evaluation": "..."
    }
  ],
  "activities": [
    {
      "title": "...",
      "objective": "...",
      "text": "...",
      "questions": ["..."],
      "solution": "...",
      "commonErrors": "...",
      "conclusion": "..."
    }
  ],
  "rule": {
    "statement": "...",
    "explanation": "...",
    "conditions": "...",
    "examples": ["..."],
    "warnings": "..."
  },
  "solvedExamples": [
    {"example": "...", "steps": ["...", "..."]}
  ],
  "exercises": [
    {"text": "...", "skills": "...", "solution": "..."}
  ],
  "evaluationQuiz": {
    "questions": ["..."],
    "solution": "..."
  },
  "homework": "...",
  "teacherNotes": "..."
}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let textResponse = response.text;
    textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResult = JSON.parse(textResponse);

    res.json({ success: true, data: jsonResult });
  } catch (error) {
    console.error('Error generating lesson:', error);
    res.status(500).json({ success: false, message: 'فشل توليد المذكرة، يرجى المحاولة لاحقاً أو التحقق من الاتصال.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
