import { useState } from 'react';

export default function MessageEditor() {
  const [template, setTemplate] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  // Lista de números extraídos do input
  const phoneList = phone
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);

  // Todos os números são válidos (12 ou 13 dígitos)
  const allPhonesValid = phoneList.every(p => /^\d{12,13}$/.test(p));
  const phoneIsValid = phoneList.length > 0 && allPhonesValid;

  const msgIsValid = template.trim().length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneIsValid || !msgIsValid) return;

    setSending(true);
    try {
      const res = await fetch('http://localhost:3333/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers: phoneList,
          message: template,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('✅ Mensagem enviada com sucesso!');
        setTemplate('');
        setPhone('');
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

      {/* Campo para múltiplos números */}
      <input
        className="input w-full"
        placeholder="Números: 55DDDXXXXXXXXX,55DDDXXXXXXXXX"
        value={phone}
        onChange={(e) => {
          const onlyDigitsAndComma = e.target.value.replace(/[^\d,]/g, '');
          setPhone(onlyDigitsAndComma);
        }}
      />

      {/* Campo de mensagem */}
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
