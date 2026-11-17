import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { db } from "@micronuage/sdk";
import { AppShell } from "@/components/AppShell";
import { PRIORIDADES, STATUS, errorMessage, formatDate, isTech } from "@/lib/tickets";
import type { Comment, Ticket } from "@/lib/tickets";
import { cn } from "@/lib/utils";

type Me = { id: string; name: string; role: string };

const field = "w-full rounded-site border border-current/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary";
const primary = "rounded-site bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50";

function Tickets({ me }: { me: Me }) {
  const tech = isTech(me.role);
  const [items, setItems] = useState<Ticket[]>([]);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<string>("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [form, setForm] = useState({ titulo: "", descricao: "", prioridade: "Média" });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await db.list("chamados", { sort: "-created_at", limit: 200 });
      setItems(res.items as unknown as Ticket[]);
      setLabels(res.labels as Record<string, string>);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadComments = useCallback(async (id: string) => {
    try {
      const res = await db.list("comentarios", { where: { chamado: id }, sort: "created_at", limit: 200 });
      setComments(res.items as unknown as Comment[]);
      setLabels((l) => ({ ...l, ...(res.labels as Record<string, string>) }));
    } catch (e) {
      setError(errorMessage(e));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedId) void loadComments(selectedId);
    else setComments([]);
  }, [selectedId, loadComments]);

  const selected = items.find((t) => t.id === selectedId) ?? null;
  const shown = items.filter((t) => filter === "Todos" || t.status === filter);

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const create = (e: FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const r = await db.create("chamados", { titulo: form.titulo.trim(), descricao: form.descricao.trim(), prioridade: form.prioridade, status: "Aberto", solicitante: me.id });
      setForm({ titulo: "", descricao: "", prioridade: "Média" });
      await load();
      setSelectedId(r.id);
    });
  };

  const update = (id: string, values: Record<string, unknown>) =>
    run(async () => {
      await db.update("chamados", id, values);
      await load();
    });

  const comment = (e: FormEvent) => {
    e.preventDefault();
    if (!selected || !commentText.trim()) return;
    void run(async () => {
      await db.create("comentarios", { chamado: selected.id, texto: commentText.trim(), autor: me.id, solicitante: selected.solicitante ?? me.id });
      setCommentText("");
      await loadComments(selected.id);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">{tech ? "Todos os chamados" : "Meus chamados"}</h1>
        <p className="mt-1 opacity-70">{tech ? "Assuma chamados, altere o status e comente." : "Abra um chamado e acompanhe o atendimento."}</p>
      </div>
      {error && <p role="alert" className="rounded-site border border-primary/40 bg-primary/10 p-3 text-sm">{error}</p>}

      {!tech && (
        <form onSubmit={create} className="space-y-3 rounded-site border border-current/10 bg-muted p-4">
          <h2 className="font-semibold">Abrir novo chamado</h2>
          <label className="block text-sm">Título
            <input required className={cn(field, "mt-1")} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: Não consigo acessar o e-mail" />
          </label>
          <label className="block text-sm">Descrição
            <textarea required rows={3} className={cn(field, "mt-1")} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Conte o que aconteceu e desde quando" />
          </label>
          <label className="block text-sm sm:max-w-xs">Prioridade
            <select className={cn(field, "mt-1")} value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}>
              {PRIORIDADES.map((p) => <option key={p} className="text-neutral-900">{p}</option>)}
            </select>
          </label>
          <button type="submit" disabled={busy} className={primary}>{busy ? "Enviando…" : "Abrir chamado"}</button>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {["Todos", ...STATUS].map((s) => (
          <button key={s} type="button" onClick={() => setFilter(s)} className={cn("rounded-full px-3 py-1 text-sm", filter === s ? "bg-primary text-white" : "border border-current/20 opacity-75")}>{s}</button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-2">
          {loading && <p className="opacity-70">Carregando chamados…</p>}
          {!loading && shown.length === 0 && <p className="rounded-site border border-dashed border-current/20 p-6 text-center text-sm opacity-70">Nenhum chamado por aqui.</p>}
          {shown.map((t) => (
            <button key={t.id} type="button" onClick={() => setSelectedId(t.id)} className={cn("block w-full rounded-site border p-4 text-left", t.id === selectedId ? "border-primary bg-primary/10" : "border-current/10 hover:bg-current/5")}>
              <span className="flex items-start justify-between gap-3">
                <span className="font-medium">{t.titulo}</span>
                <span className="shrink-0 rounded-full bg-current/10 px-2 py-0.5 text-xs">{t.status}</span>
              </span>
              <span className="mt-1 block text-xs opacity-65">
                {t.prioridade} · {formatDate(t.created_at)}{tech && t.solicitante ? ` · ${labels[t.solicitante] ?? ""}` : ""}
              </span>
            </button>
          ))}
        </div>

        <div>
          {!selected ? (
            <p className="rounded-site border border-dashed border-current/20 p-6 text-center text-sm opacity-70">Selecione um chamado para ver os detalhes.</p>
          ) : (
            <div className="space-y-4 rounded-site border border-current/10 bg-muted p-5">
              <div>
                <h2 className="font-heading text-xl font-semibold">{selected.titulo}</h2>
                <p className="mt-1 text-xs opacity-65">
                  Prioridade {selected.prioridade} · aberto em {formatDate(selected.created_at)}
                  {selected.solicitante ? ` por ${labels[selected.solicitante] ?? "—"}` : ""}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm">{selected.descricao}</p>
              </div>
              <p className="text-sm">
                <span className="opacity-65">Status:</span> <strong>{selected.status}</strong>
                <span className="opacity-65"> · Técnico:</span> {selected.tecnico ? labels[selected.tecnico] ?? "—" : "ninguém assumiu ainda"}
              </p>
              {tech && (
                <div className="flex flex-wrap items-end gap-3">
                  {selected.tecnico !== me.id && (
                    <button type="button" disabled={busy} className={primary} onClick={() => void update(selected.id, { tecnico: me.id, status: selected.status === "Resolvido" ? "Resolvido" : "Em atendimento" })}>Assumir chamado</button>
                  )}
                  <label className="text-sm">Alterar status
                    <select className={cn(field, "mt-1")} value={selected.status} disabled={busy} onChange={(e) => void update(selected.id, { status: e.target.value })}>
                      {STATUS.map((s) => <option key={s} className="text-neutral-900">{s}</option>)}
                    </select>
                  </label>
                </div>
              )}
              <div>
                <h3 className="mb-2 text-sm font-semibold">Comentários</h3>
                <div className="space-y-2">
                  {comments.length === 0 && <p className="text-sm opacity-65">Ainda sem comentários.</p>}
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-site bg-current/5 p-3 text-sm">
                      <p className="text-xs opacity-65">{c.autor ? labels[c.autor] ?? "—" : "—"} · {formatDate(c.created_at)}</p>
                      <p className="mt-1 whitespace-pre-wrap">{c.texto}</p>
                    </div>
                  ))}
                </div>
                <form onSubmit={comment} className="mt-3 flex gap-2">
                  <input className={field} value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Escreva um comentário" aria-label="Comentário" />
                  <button type="submit" disabled={busy || !commentText.trim()} className={primary}>Enviar</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IndexPage() {
  return (
    <>
      <title>Chamados · Monitoo</title>
      <meta name="description" content="Abra, acompanhe e atenda chamados internos de TI na Monitoo." />
      <AppShell>{(me) => <Tickets me={me} />}</AppShell>
    </>
  );
}
