export default function MessageEditor({
  template,
  setTemplate,
}: {
  template: string;
  setTemplate: (t: string) => void;
}) {
  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-2">Mensagem</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Mensagem enviada!"); // sua função aqui
        }}
      >
        <textarea
          className="input w-full"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder="Ex: Olá {{nome}}, tudo bem?"
          rows={10}
        />

        <div className="button-group">
          <button type="submit" className="btn" disabled={!template.trim()}>
            Enviar Mensagem
          </button>
        </div>
      </form>
    </section>
  );
}
