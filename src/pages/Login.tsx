import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { MicronuageError, auth, useUser } from "@micronuage/sdk";
import { site } from "@/content/site";

const input = "mt-1 h-11 w-full rounded-site border border-current/20 bg-background px-3 text-[15px] outline-none focus:border-primary";

export default function LoginPage() {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up" | "reset">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "reset") {
        await auth.requestPasswordReset(email);
        setInfo("Se o e-mail estiver cadastrado, enviamos um link para criar uma nova senha.");
      } else {
        if (mode === "up") await auth.signUp({ name, email, password });
        else await auth.signIn({ email, password });
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof MicronuageError ? err.message : "Algo deu errado. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  const title = mode === "in" ? "Entrar" : mode === "up" ? "Criar conta" : "Recuperar senha";

  return (
    <>
      <title>{title} · Moda Fácil</title>
      <meta name="description" content="Acesse o controle de estoque da Moda Fácil." />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <p className="font-heading text-xl font-semibold text-primary">{site.name}</p>
        <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 opacity-70">Controle de estoque da loja.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {mode === "up" && (
            <label className="block text-sm">
              Nome
              <input required value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} />
            </label>
          )}
          <label className="block text-sm">
            E-mail
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={input} />
          </label>
          {mode !== "reset" && (
            <label className="block text-sm">
              Senha
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "up" ? "new-password" : "current-password"} className={input} />
            </label>
          )}
          {error && <p role="alert" className="text-sm text-primary">{error}</p>}
          {info && <p role="status" className="text-sm">{info}</p>}
          <button type="submit" disabled={busy} className="h-12 w-full rounded-site bg-primary text-[15px] font-medium text-white hover:opacity-90 disabled:opacity-60">
            {busy ? "Aguarde…" : mode === "reset" ? "Enviar link" : title}
          </button>
        </form>
        <div className="mt-6 flex flex-col gap-2 text-sm">
          {mode !== "in" && <button type="button" onClick={() => setMode("in")} className="text-left underline">Já tenho conta</button>}
          {mode !== "up" && <button type="button" onClick={() => setMode("up")} className="text-left underline">Criar uma conta</button>}
          {mode === "in" && <button type="button" onClick={() => setMode("reset")} className="text-left underline">Esqueci minha senha</button>}
        </div>
      </div>
    </>
  );
}
