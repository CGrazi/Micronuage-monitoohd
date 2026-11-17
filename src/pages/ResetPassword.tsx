import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { auth } from "@micronuage/sdk";
import { errorMessage } from "@/lib/tickets";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await auth.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <title>Nova senha · Monitoo</title>
      <meta name="description" content="Crie uma nova senha para acessar o Monitoo." />
      <h1 className="font-heading text-3xl font-semibold">Criar senha</h1>
      {done ? (
        <p className="mt-6">Senha salva. <Link to="/entrar" className="underline">Entrar</Link></p>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-site border border-current/10 bg-muted p-6">
          <label className="block text-sm">Nova senha
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-site border border-current/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary" autoComplete="new-password" />
          </label>
          {!token && <p className="text-sm text-primary">Link inválido: falta o código na endereço.</p>}
          {error && <p role="alert" className="text-sm text-primary">{error}</p>}
          <button type="submit" disabled={busy || !token} className="w-full rounded-site bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">{busy ? "Salvando…" : "Salvar senha"}</button>
        </form>
      )}
    </div>
  );
}
