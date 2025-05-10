import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { category } = req.query;

  const messages = [
    {
      role: 'system',
      content: 'Eres un generador de quizzes para estudiantes.',
    },
    {
      role: 'user',
      content: `Genera 5 preguntas tipo test sobre la categoría "${category}". Cada pregunta debe tener 4 opciones (a, b, c, d) y especificar la respuesta correcta. Devuelve el resultado en formato JSON con esta estructura:

[
  {
    "pregunta": "¿Cuál es la capital de Francia?",
    "opciones": {
      "a": "Madrid",
      "b": "Berlín",
      "c": "París",
      "d": "Roma"
    },
    "respuesta_correcta": "c"
  }
]`,
    },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']') + 1;
    const jsonString = content.slice(jsonStart, jsonEnd);
    const questions = JSON.parse(jsonString);

    res.status(200).json({ questions });
  } catch (error) {
    console.error('Error al generar preguntas:', error.message);
    res.status(500).json({ error: 'No se pudieron generar preguntas' });
  }
}
