import type { ComponentType } from "react";
import IndexPage from "@/pages/Index";
import LoginPage from "@/pages/Login";
import ResetPasswordPage from "@/pages/ResetPassword";

/** Every page of the site. The menu (src/content/site.ts) links to these paths. */
export const routes: { path: string; name: string; Page: ComponentType }[] = [
  { path: "/", name: "Estoque", Page: IndexPage },
  { path: "/entrar", name: "Entrar", Page: LoginPage },
  { path: "/reset-password", name: "Nova senha", Page: ResetPasswordPage },
];
