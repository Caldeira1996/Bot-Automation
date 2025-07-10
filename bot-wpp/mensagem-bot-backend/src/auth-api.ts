// auth-api.ts
import express from 'express';
import mysql from 'mysql2/promise';
import { hasActiveSubscription, updateWhatsappNumber } from './database';

export const authRouter = express.Router();

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '1234',
  database: 'bot_wpp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Rota para atualizar número do WhatsApp
authRouter.post('/update-whatsapp', async (req, res) => {
  try {
    const { userId, whatsappNumber } = req.body;

    if (!userId) return res.status(400).json({ error: 'userId é obrigatório' });
    if (!whatsappNumber) return res.status(400).json({ error: 'whatsappNumber é obrigatório' });

    const userIdParsed = Number(userId);
    if (isNaN(userIdParsed)) return res.status(400).json({ error: 'userId inválido' });

    await updateWhatsappNumber(userIdParsed, whatsappNumber);
    res.json({ ok: true, message: 'Whatsapp atualizado com sucesso' });
  } catch (error: any) {
    console.error('Erro updateWhatsapp:', error);
    res.status(400).json({ error: error.message });
  }
});

// Rota para criar novo usuário
authRouter.post('/users', async (req, res) => {
  try {
    const { nome, email, senha, whatsappNumber } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
    }

    const [result]: any = await pool.query(
      'INSERT INTO users (nome, email, senha, whatsapp_number) VALUES (?, ?, ?, ?)',
      [nome, email, senha, whatsappNumber || null]
    );

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user_id: result.insertId,
    });
  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: error.message || 'Erro desconhecido' });
  }
});

// Rota para validar acesso do usuário
authRouter.get('/validate-access/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'userId inválido' });
    }

    const canAccess = await hasActiveSubscription(userId);
    res.json({ canAccess });
  } catch (error: any) {
    console.error('Erro validate-access:', error);
    res.status(500).json({ error: error.message });
  }
});
