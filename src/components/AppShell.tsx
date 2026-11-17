import { useEffect } from "react";
import type { ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth, useUser } from "@micronuage/sdk";
import { site } from "@/content/site";
import { isTech } from "@/lib/tickets";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<string, string> = { admin: "Administrador", tecnico: "Técnico", colaborador: "Colaborador" };

export function AppShell({ children, techOnly, adminOnly }: { children: (user: { id: string; name: string; role: string }) => ReactNode; techOnly?: boolean; adminOnly?: boolean }) {
  const { user, loading } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/entrar");
  }, [loading, user, navigate]);

  if (loading || !user) return <p className="p-10 text-center opacity-70">Carregando…</p>;

  const tech = isTech(user.role);
  const link = ({ isActive }: { isActive: boolean }) =>
    cn("rounded-site px-3 py-2 text-sm", isActive ? "bg-primary text-white" : "opacity-75 hover:bg-current/5 hover:opacity-100");
  const denied = (adminOnly && user.role !== "admin") || (techOnly && !tech);

  return (
    <div className="min-h-screen">
      <header className="border-b border-current/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-8">
          <Link to="/" className="font-heading text-lg font-semibold">{site.name}</Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
            <NavLink to="/" end className={link}>Chamados</NavLink>
            <NavLink to="/painel" className={link}>Painel</NavLink>
            {user.role === "admin" && <NavLink to="/equipe" className={link}>Equipe</NavLink>}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="opacity-75">{user.name} · {ROLE_LABEL[user.role] ?? user.role}</span>
            <button
              type="button"
              className="rounded-site border border-current/20 px-3 py-1.5 hover:bg-current/5"
              onClick={async () => {
                await auth.signOut();
                navigate("/entrar");
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {denied ? <p className="opacity-75">Você não tem acesso a esta página.</p> : children({ id: user.id, name: user.name, role: user.role })}
      </div>
    </div>
  );
}
