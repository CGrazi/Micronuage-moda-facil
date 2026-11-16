import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MicronuageError, auth } from "@micronuage/sdk";

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
      setError(err instanceof MicronuageError ? err.message : "Algo deu errado. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <title>Nova senha · Moda Fácil</title>
      <meta name="description" content="Crie uma nova senha para acessar o estoque da Moda Fácil." />
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Nova senha</h1>
        {done ? (
          <p className="mt-6">
            Senha atualizada. <Link to="/entrar" className="underline">Entrar</Link>
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block text-sm">
              Nova senha
              <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="mt-1 h-11 w-full rounded-site border border-current/20 bg-background px-3 text-[15px] outline-none focus:border-primary" />
            </label>
            {error && <p role="alert" className="text-sm text-primary">{error}</p>}
            <button type="submit" disabled={busy || !token} className="h-12 w-full rounded-site bg-primary text-[15px] font-medium text-white hover:opacity-90 disabled:opacity-60">
              {busy ? "Aguarde…" : "Salvar senha"}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
