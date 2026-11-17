import type { ComponentType } from "react";
import IndexPage from "@/pages/Index";
import PainelPage from "@/pages/Painel";
import EquipePage from "@/pages/Equipe";
import EntrarPage from "@/pages/Entrar";
import ResetPasswordPage from "@/pages/ResetPassword";

/** Every page of the site. The menu (src/content/site.ts) links to these paths. */
export const routes: { path: string; name: string; Page: ComponentType }[] = [
  { path: "/", name: "Chamados", Page: IndexPage },
  { path: "/painel", name: "Painel", Page: PainelPage },
  { path: "/equipe", name: "Equipe", Page: EquipePage },
  { path: "/entrar", name: "Entrar", Page: EntrarPage },
  { path: "/reset-password", name: "Nova senha", Page: ResetPasswordPage },
];
