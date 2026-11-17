export const STATUS = ["Aberto", "Em atendimento", "Resolvido"] as const;
export const PRIORIDADES = ["Baixa", "Média", "Alta", "Urgente"] as const;

export type Ticket = {
  id: string;
  created_at: string;
  titulo: string;
  descricao: string;
  prioridade: string;
  status: string;
  solicitante: string | null;
  tecnico: string | null;
};

export type Comment = {
  id: string;
  created_at: string;
  chamado: string;
  texto: string;
  autor: string | null;
};

/** Técnicos e administradores atendem chamados. */
export function isTech(role: string | undefined | null): boolean {
  return role === "tecnico" || role === "admin";
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : "Algo deu errado. Tente de novo.";
}
