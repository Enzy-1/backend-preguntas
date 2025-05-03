import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json()); // Para poder parsear el cuerpo de las peticiones JSON

// Conectar a MongoDB
mongoose.connect('mongodb+srv://enzoaguino01:Wa4UBo0Tc1UV61dM@cluster0.g4gsp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado a MongoDB'))
  .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Modelo de MongoDB para almacenar los resultados
const resultSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  categoria: String,
  preguntas: Array,
  puntaje: Number,
});

const Result = mongoose.model('Result', resultSchema);

// Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ruta para obtener preguntas
app.get('/api/questions', async (req, res) => {
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
    res.json({ questions });
  } catch (error) {
    console.error('Error al generar preguntas:', error.message);
    res.status(500).json({ error: 'No se pudieron generar preguntas' });
  }
});

// Ruta para guardar los resultados
app.post('/api/save-result', async (req, res) => {
  const { categoria, preguntas, puntaje } = req.body;

  // Crear un nuevo documento con el resultado
  const newResult = new Result({
    categoria,
    preguntas,
    puntaje,
  });

  try {
    await newResult.save();
    res.status(200).json({ message: 'Resultado guardado exitosamente' });
  } catch (error) {
    console.error('Error al guardar el resultado:', error);
    res.status(500).json({ error: 'Error al guardar el resultado' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend en http://localhost:${port}`);
});
