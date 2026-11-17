import { useCallback, useEffect, useState } from "react";
import { users } from "@micronuage/sdk";
import { AppShell } from "@/components/AppShell";
import { errorMessage } from "@/lib/tickets";

type U = { id: string; name: string; email: string; role: string; status: string };

function Team({ meId }: { meId: string }) {
  const [list, setList] = useState<U[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r: unknown = await users.list();
      const arr = Array.isArray(r) ? r : ((r as { items?: unknown[] }).items ?? []);
      setList(arr as U[]);
      setError("");
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setRole = async (id: string, role: string) => {
    try {
      await users.update(id, { role });
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Equipe</h1>
        <p className="mt-1 opacity-70">Defina quem atende chamados (Técnico) e quem só abre (Colaborador).</p>
      </div>
      {error && <p role="alert" className="rounded-site border border-primary/40 bg-primary/10 p-3 text-sm">{error}</p>}
      {loading && <p className="opacity-70">Carregando…</p>}
      <div className="divide-y divide-current/10 rounded-site border border-current/10">
        {list.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm opacity-65">{u.email}</p>
            </div>
            <select
              aria-label={`Perfil de ${u.name}`}
              value={u.role}
              disabled={u.id === meId}
              onChange={(e) => void setRole(u.id, e.target.value)}
              className="rounded-site border border-current/20 bg-transparent px-3 py-2 text-sm disabled:opacity-50"
            >
              <option value="colaborador" className="text-neutral-900">Colaborador</option>
              <option value="tecnico" className="text-neutral-900">Técnico</option>
              <option value="admin" className="text-neutral-900">Administrador</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EquipePage() {
  return (
    <>
      <title>Equipe · Monitoo</title>
      <meta name="description" content="Gerencie os perfis de técnicos e colaboradores da Monitoo." />
      <AppShell adminOnly>{(me) => <Team meId={me.id} />}</AppShell>
    </>
  );
}
