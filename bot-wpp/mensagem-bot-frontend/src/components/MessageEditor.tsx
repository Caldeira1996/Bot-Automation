import { useState } from 'react';

export default function MessageEditor() {
  /* Campos controlados */
  const [template, setTemplate]   = useState('');
  const [phone, setPhone]         = useState('');
  const [sending, setSending]     = useState(false);

  /* Regex simples: 12 ou 13 dígitos (55 + DDD + número) */
  const phoneIsValid = /^\d{12,13}$/.test(phone);
  const msgIsValid   = template.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneIsValid || !msgIsValid) return;

    setSending(true);
    try {
      const res = await fetch('http://localhost:3333/send-message', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          number : phone,
          message: template,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Mensagem enviada com sucesso!');
        setTemplate('');
      } else {
        alert('❌ Erro: ' + (data.error || 'Falha ao enviar'));
      }
    } catch (err) {
      alert('❌ Falha na requisição: ' + (err as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="p-4 space-y-4 max-w-lg">
      <h2 className="text-xl font-semibold">Envio de Mensagem</h2>

      {/* Número de destino */}
      <input
        className="input w-full"
        placeholder="Número: 55DDDXXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
      />

      {/* Texto da mensagem */}
      <textarea
        className="input w-full"
        rows={8}
        placeholder="Digite a mensagem..."
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
      />

      <button
        className="btn"
        disabled={!phoneIsValid || !msgIsValid || sending}
        onClick={handleSubmit}
      >
        {sending ? 'Enviando…' : 'Enviar Mensagem'}
      </button>
    </section>
  );
}
