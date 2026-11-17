import { useEffect, useState } from "react";
import { db } from "@micronuage/sdk";
import { AppShell } from "@/components/AppShell";
import { PRIORIDADES, STATUS, errorMessage, isTech } from "@/lib/tickets";

type Point = { key: string | null; value: number };

function Bars({ title, labels, points }: { title: string; labels: readonly string[]; points: Point[] }) {
  const values = labels.map((l) => points.find((p) => p.key === l)?.value ?? 0);
  const max = Math.max(...values, 1);
  return (
    <section className="rounded-site border border-current/10 bg-muted p-5">
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-4 space-y-3">
        {labels.map((l, i) => (
          <div key={l}>
            <div className="flex justify-between text-sm"><span>{l}</span><strong>{values[i]}</strong></div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-current/10">
              <div className="h-full rounded-full bg-primary" style={{ width: `${(values[i]! / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Dashboard({ role }: { role: string }) {
  const [byStatus, setByStatus] = useState<Point[]>([]);
  const [byPriority, setByPriority] = useState<Point[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      db.stats("chamados", { metric: "count", group: "status" }),
      db.stats("chamados", { metric: "count", group: "prioridade" }),
    ])
      .then(([s, p]) => {
        setByStatus(s as Point[]);
        setByPriority(p as Point[]);
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  const total = byStatus.reduce((sum, p) => sum + p.value, 0);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Painel</h1>
        <p className="mt-1 opacity-70">{isTech(role) ? "Chamados de toda a empresa." : "Somente os seus chamados."}</p>
      </div>
      {error && <p role="alert" className="rounded-site border border-primary/40 bg-primary/10 p-3 text-sm">{error}</p>}
      {loading ? (
        <p className="opacity-70">Carregando…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-site border border-current/10 bg-muted p-4"><p className="text-xs opacity-65">Total</p><p className="mt-1 text-3xl font-semibold">{total}</p></div>
            {STATUS.map((s) => (
              <div key={s} className="rounded-site border border-current/10 bg-muted p-4"><p className="text-xs opacity-65">{s}</p><p className="mt-1 text-3xl font-semibold">{byStatus.find((p) => p.key === s)?.value ?? 0}</p></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Bars title="Chamados por status" labels={STATUS} points={byStatus} />
            <Bars title="Chamados por prioridade" labels={PRIORIDADES} points={byPriority} />
          </div>
        </>
      )}
    </div>
  );
}

export default function PainelPage() {
  return (
    <>
      <title>Painel · Monitoo</title>
      <meta name="description" content="Painel com os chamados de TI por status e prioridade." />
      <AppShell>{(me) => <Dashboard role={me.role} />}</AppShell>
    </>
  );
}
