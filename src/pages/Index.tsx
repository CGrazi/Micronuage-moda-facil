import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { MicronuageError, auth, db, useUser } from "@micronuage/sdk";
import { Minus, Plus, Search, Trash2 } from "lucide-react";
import { site } from "@/content/site";

type Produto = { id: string; nome: string; categoria: string; quantidade: number; preco: number };

const CATEGORIAS = ["Camisetas", "Calças", "Vestidos", "Casacos", "Calçados", "Acessórios", "Outros"];
const LOW = 5;
const brl = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const input = "h-11 w-full rounded-site border border-current/20 bg-background px-3 text-[15px] outline-none focus:border-primary";
const msg = (e: unknown) => (e instanceof MicronuageError ? e.message : "Algo deu errado. Tente de novo.");

export default function IndexPage() {
  const { user, loading } = useUser();
  const [items, setItems] = useState<Produto[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ nome: "", categoria: CATEGORIAS[0], quantidade: "", preco: "" });
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ products: 0, units: 0, value: 0, low: 0 });

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await db.list("produtos", { search: search.trim() || undefined, sort: "-created_at", limit: 200 });
      setItems(res.items as unknown as Produto[]);
      const all = search.trim() ? await db.list("produtos", { limit: 1000 }) : res;
      const list = all.items as unknown as Produto[];
      setStats({
        products: list.length,
        units: list.reduce((s, p) => s + p.quantidade, 0),
        value: list.reduce((s, p) => s + p.quantidade * p.preco, 0),
        low: list.filter((p) => p.quantidade <= LOW).length,
      });
      setError("");
    } catch (e) {
      setError(msg(e));
    } finally {
      setBusy(false);
    }
  }, [search]);

  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  if (loading) return <p className="p-10 text-center opacity-70">Carregando…</p>;
  if (!user) return <Navigate to="/entrar" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await db.create("produtos", {
        nome: form.nome.trim(),
        categoria: form.categoria,
        quantidade: Math.max(0, Math.round(Number(form.quantidade) || 0)),
        preco: Number(form.preco) || 0,
      });
      setForm({ nome: "", categoria: CATEGORIAS[0], quantidade: "", preco: "" });
      await load();
    } catch (err) {
      setError(msg(err));
    } finally {
      setSaving(false);
    }
  };

  const adjust = async (p: Produto, delta: number) => {
    const quantidade = Math.max(0, p.quantidade + delta);
    try {
      await db.update("produtos", p.id, { quantidade });
      await load();
    } catch (err) {
      setError(msg(err));
    }
  };

  const remove = async (p: Produto) => {
    if (!window.confirm("Excluir " + p.nome + "?")) return;
    try {
      await db.remove("produtos", p.id);
      await load();
    } catch (err) {
      setError(msg(err));
    }
  };

  const kpis = [
    { label: "Produtos", value: String(stats.products) },
    { label: "Unidades em estoque", value: String(stats.units) },
    { label: "Valor em estoque", value: brl(stats.value) },
    { label: "Estoque baixo", value: String(stats.low) },
  ];

  return (
    <>
      <title>Estoque · Moda Fácil</title>
      <meta name="description" content="Controle de estoque da Moda Fácil: produtos, categorias, quantidades e preços." />
      <header className="border-b border-current/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <p className="font-heading text-lg font-semibold">{site.name}</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden opacity-70 sm:inline">{user.name || user.email}</span>
            <button type="button" onClick={() => void auth.signOut().then(() => window.location.assign("/entrar"))} className="rounded-site border border-current/20 px-3 py-2 hover:bg-current/5">
              Sair
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-8 sm:px-8">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Estoque</h1>
          <p className="mt-1 opacity-70">Cadastre produtos e acompanhe as quantidades da loja.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-site border border-current/10 bg-muted p-4">
              <p className="text-xs font-medium uppercase tracking-wider opacity-60">{k.label}</p>
              <p className="mt-2 font-heading text-2xl font-semibold">{k.value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="rounded-site border border-current/10 p-5">
          <h2 className="font-heading text-lg font-semibold">Cadastrar produto</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.2fr_1fr_1fr_auto]">
            <label className="text-sm">
              Nome
              <input required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} className={input + " mt-1"} />
            </label>
            <label className="text-sm">
              Categoria
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className={input + " mt-1"}>
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="text-sm">
              Quantidade
              <input required type="number" min={0} step={1} value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: e.target.value })} className={input + " mt-1"} />
            </label>
            <label className="text-sm">
              Preço (R$)
              <input required type="number" min={0} step="0.01" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} className={input + " mt-1"} />
            </label>
            <button type="submit" disabled={saving} className="h-11 self-end rounded-site bg-primary px-5 text-[15px] font-medium text-white hover:opacity-90 disabled:opacity-60">
              {saving ? "Salvando…" : "Adicionar"}
            </button>
          </div>
        </form>

        {error && (
          <p role="alert" className="rounded-site border border-current/20 bg-muted p-3 text-sm">
            {error}
          </p>
        )}

        <section aria-label="Lista de produtos">
          <div className="relative mb-4 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 opacity-50" aria-hidden="true" />
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome ou categoria" aria-label="Buscar produtos" className={input + " pl-9"} />
          </div>
          <div className="overflow-x-auto rounded-site border border-current/10">
            <table className="w-full min-w-[40rem] text-left text-[15px]">
              <thead className="bg-muted text-xs uppercase tracking-wider opacity-70">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Quantidade</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-current/10">
                    <td className="px-4 py-3 font-medium">{p.nome}</td>
                    <td className="px-4 py-3 opacity-80">{p.categoria}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => void adjust(p, -1)} aria-label={"Diminuir quantidade de " + p.nome} className="grid size-8 place-items-center rounded-site border border-current/20 hover:bg-current/5">
                          <Minus className="size-4" aria-hidden="true" />
                        </button>
                        <span className={p.quantidade <= LOW ? "min-w-8 text-center font-semibold text-primary" : "min-w-8 text-center"}>{p.quantidade}</span>
                        <button type="button" onClick={() => void adjust(p, 1)} aria-label={"Aumentar quantidade de " + p.nome} className="grid size-8 place-items-center rounded-site border border-current/20 hover:bg-current/5">
                          <Plus className="size-4" aria-hidden="true" />
                        </button>
                        {p.quantidade <= LOW && <span className="text-xs text-primary">baixo</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">{brl(p.preco)}</td>
                    <td className="px-4 py-3 text-right">
                      {user.role === "admin" && (
                        <button type="button" onClick={() => void remove(p)} aria-label={"Excluir " + p.nome} className="rounded-site p-2 opacity-60 hover:opacity-100">
                          <Trash2 className="size-4" aria-hidden="true" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!busy && items.length === 0 && (
              <p className="p-6 text-center opacity-70">{search ? "Nenhum produto encontrado para essa busca." : "Nenhum produto cadastrado ainda. Use o formulário acima para adicionar o primeiro."}</p>
            )}
            {busy && <p className="p-6 text-center opacity-70">Carregando…</p>}
          </div>
          <p className="mt-3 text-sm opacity-60">
            <Link to="/entrar" className="hover:underline">Trocar de conta</Link>
          </p>
        </section>
      </div>
    </>
  );
}
