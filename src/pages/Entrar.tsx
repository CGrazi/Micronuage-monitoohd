import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "@micronuage/sdk";
import { errorMessage } from "@/lib/tickets";

const field = "mt-1 w-full rounded-site border border-current/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary";

export default function EntrarPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "reset") {
        await auth.requestPasswordReset(email);
        setInfo("Se o e-mail estiver cadastrado, enviamos o link para criar uma nova senha.");
      } else {
        if (mode === "up") await auth.signUp({ name, email, password });
        else await auth.signIn({ email, password });
        navigate("/");
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <title>Entrar · Monitoo</title>
      <meta name="description" content="Entre no Monitoo para abrir e acompanhar chamados internos de TI." />
      <h1 className="font-heading text-3xl font-semibold">Monitoo</h1>
      <p className="mt-2 opacity-70">Chamados internos de TI.</p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-site border border-current/10 bg-muted p-6">
        <h2 className="font-semibold">{mode === "in" ? "Entrar" : mode === "up" ? "Criar conta" : "Recuperar senha"}</h2>
        {mode === "up" && <label className="block text-sm">Nome<input required className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>}
        <label className="block text-sm">E-mail<input required type="email" className={field} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
        {mode !== "reset" && <label className="block text-sm">Senha<input required type="password" minLength={6} className={field} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} /></label>}
        {error && <p role="alert" className="text-sm text-primary">{error}</p>}
        {info && <p className="text-sm">{info}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-site bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {busy ? "Aguarde…" : mode === "in" ? "Entrar" : mode === "up" ? "Criar conta" : "Enviar link"}
        </button>
        <div className="flex flex-wrap justify-between gap-2 text-sm opacity-80">
          {mode === "in" ? (
            <>
              <button type="button" className="underline" onClick={() => setMode("up")}>Criar conta</button>
              <button type="button" className="underline" onClick={() => setMode("reset")}>Esqueci a senha</button>
            </>
          ) : (
            <button type="button" className="underline" onClick={() => setMode("in")}>Voltar para entrar</button>
          )}
        </div>
      </form>
    </div>
  );
}
