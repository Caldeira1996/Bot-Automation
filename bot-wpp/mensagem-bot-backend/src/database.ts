import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // 👈 ajuste conforme seu usuário real
  password: '1234', // 👈 ajuste conforme sua senha real
  database: 'bot_wpp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Função para verificar se whatsapp_number está registrado em outro usuário
export async function isWhatsappRegistered(whatsappNumber: string): Promise<boolean> {
  const [rows] = await pool.query(
    'SELECT 1 FROM users WHERE whatsapp_number = ? LIMIT 1',
    [whatsappNumber]
  );
  return (rows as any[]).length > 0;
}

// Atualizar whatsapp do usuário (corrigido: userId como number)
export async function updateWhatsappNumber(userId: number, whatsappNumber: string): Promise<void> {
  if (await isWhatsappRegistered(whatsappNumber)) {
    throw new Error('Whatsapp já cadastrado para outro usuário');
  }

  await pool.query(
    'UPDATE users SET whatsapp_number = ? WHERE user_id = ?',
    [whatsappNumber, userId]
  );
}

// Verificar se o usuário tem assinatura ativa (corrigido: userId como number)
export async function hasActiveSubscription(userId: number): Promise<boolean> {
  const [rows] = await pool.query(
    `SELECT 1 FROM subscriptions 
     WHERE user_id = ? AND status = 'active' 
       AND (end_date IS NULL OR end_date > CURDATE()) 
     LIMIT 1`,
    [userId]
  );
  return (rows as any[]).length > 0;
}
