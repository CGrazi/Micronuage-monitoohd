# Monitoo — regras do projeto

Regras que toda mudança deste projeto mantém. A IA da Micronuage lê este arquivo a cada pedido e acrescenta as decisões que tomar.

- Os dados do negócio (nome, contatos, menu, rodapé) ficam em `src/content/site.ts`.
- O app é de chamados internos de TI e usa dados reais: coleções `chamados` e `comentarios` em `data/model.json`, acessadas com `@micronuage/sdk`. Não há dados de exemplo.
- Perfis: `colaborador` (abre chamados e vê só os seus), `tecnico` (vê todos, assume, muda status e comenta) e `admin` (tudo, e define perfis em /equipe). Quem cria conta entra como colaborador; a primeira conta é admin.
- Status dos chamados: Aberto, Em atendimento, Resolvido; prioridades: Baixa, Média, Alta, Urgente (`src/lib/tickets.ts`).
- Páginas privadas usam `AppShell` (`src/components/AppShell.tsx`), que manda quem não entrou para /entrar.
- Formulários de contato enviam com `submitLead()` de `src/lib/micronuage.ts`.
- Cores, fontes e cantos vêm dos tokens de `src/index.css` (`@theme`); nenhum componente fixa uma cor.
- Cada página tem sua rota em `src/routes.ts`; `npm test` confere que o menu só leva a páginas que existem.
- Número de registro profissional, CNPJ, preços e números do negócio só entram quando o cliente informar.
