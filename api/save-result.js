import { connectDB } from '../../lib/mongodb';
import mongoose from 'mongoose';

const ResultSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  categoria: String,
  preguntas: Array,
  puntaje: Number,
});

const Result = mongoose.models.Result || mongoose.model('Result', ResultSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end('Only POST allowed');

  const { categoria, preguntas, puntaje } = req.body;

  try {
    await connectDB();
    const newResult = new Result({ categoria, preguntas, puntaje });
    await newResult.save();

    res.status(200).json({ message: 'Resultado guardado exitosamente' });
  } catch (error) {
    console.error('Error al guardar:', error);
    res.status(500).json({ error: 'Error al guardar resultado' });
  }
}
