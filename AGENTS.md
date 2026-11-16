# Moda Fácil — regras do projeto

Regras que toda mudança deste projeto mantém. A IA da Micronuage lê este arquivo a cada pedido e acrescenta as decisões que tomar.

- Os dados do negócio (nome, contatos, menu, rodapé) ficam em `src/content/site.ts`.
- As telas do app ficam em `src/components/workspace/`; enquanto o app for um protótipo, os dados de exemplo ficam nas props de `<Workspace>` de cada página — "Preparar agora" troca por dados reais (`data/model.json` e `@micronuage/sdk`).
- Formulários enviam com `submitLead()` de `src/lib/micronuage.ts` (as mensagens chegam na caixa de Leads da Micronuage); contas e dados salvos usam `@micronuage/sdk` e `data/model.json`.
- Cores, fontes e cantos vêm dos tokens de `src/index.css` (`@theme`); nenhum componente fixa uma cor.
- Ícones são do `lucide-react`; nunca emoji no lugar de ícone.
- Cada página tem sua rota em `src/routes.ts`; `npm test` confere que o menu só leva a páginas que existem.
- Produtos ficam na coleção `produtos` de `data/model.json` (nome, categoria, quantidade, preço); a página inicial lista, busca e cadastra; login em `/entrar`. As telas de exemplo de `src/components/workspace/` não são mais usadas.
- Número de registro profissional (CRO, CRM, OAB…), CNPJ, preços e números do negócio só entram quando o cliente informar.
