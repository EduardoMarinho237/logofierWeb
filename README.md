# Logofier Frontend

Interface web do **Logofier** — ferramenta para adicionar logos em lotes de PDFs.
Permite criar jobs, posicionar o logo na página, revisar o resultado e baixar os
PDFs processados.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **Tailwind CSS v4**
- **Zustand** — estado global (auth)
- **Konva / react-konva** — editor visual de posicionamento do logo
- **Axios** — comunicação com a API (com refresh-token automático)

## Pré-requisitos

- Node.js 20+
- Uma instância da **API Logofier** rodando em `http://localhost:8000`
  (veja o repo [logofierApi](https://github.com/EduardoMarinho237/logofierApi) —
  `docker compose up -d --build`) ou qualquer outro `API_URL` configurável.

## Setup

```bash
npm install
```

Crie um arquivo `.env.local` (opcional na dev local — já existe fallback):

```bash
# URL da API. Usado pelo proxy em next.config.ts (rewrite /api/* -> API_URL/*).
API_URL=http://localhost:8000

# Link de WhatsApp usado na landing page (opcional).
WHATSAPP_URL=https://wa.me/5581991007965
```

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

> O app **não** chama a API diretamente pelo navegador: o `next.config.ts`
> faz rewrite de `/api/:path*` para `${API_URL}/api/:path*` (mesma origem),
> evitando problemas de CORS e facilitando o deploy.

## Scripts

| Comando | Descrição |
|--------|-----------|
| `npm run dev` | Servidor de desenvolvimento (hot reload) |
| `npm run build` | Build de produção |
| `npm run start` | Serve o build de produção (após `build`) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Checagem de tipos |

## Estrutura

```
src/
├── app/                    # Rotas (App Router)
│   ├── login/              # Autenticação
│   ├── dashboard/          # Novo job (wizard) e listagem
│   ├── arrange/[jobId]/    # Upload/confirmação de PDFs
│   ├── position/[jobId]/   # Posicionamento do logo (editor Konva)
│   ├── review/[jobId]/     # Revisão página a página
│   ├── download/[jobId]/   # Download do ZIP final
│   ├── logos/              # Logos salvos
│   ├── presets/            # Presets de posição
│   ├── processings/        # Histórico de jobs
│   └── admin/              # Administração (usuários + metadados)
├── components/             # UI genérica (buttons, modais, layout…)
├── hooks/                  # Hooks compartilhados
├── lib/api.ts              # Cliente HTTP (refresh-token + retry 401)
├── lib/format.ts           # Formatação de valores
├── stores/authStore.ts     # Estado de autenticação (Zustand)
└── web/…                   # (se aplicável)
```

## Autenticação

- Login/registro via `/api/auth/*`.
- Tokens de acesso são renovados automaticamente: um refresh-token é mantido
  no `localStorage` (`logofier_refresh_token`) e o `api.ts` faz refresh com
  singleton (evita chamadas concorrentes) + retry do request original em 401.
- Logout revoga os refresh-tokens no backend.

## CI

`.github/workflows/ci.yml` — a cada push/PR:

```bash
npm ci
npm run lint
npx tsc --noEmit
```

## Deploy (Vercel)

1. Empurre o repositório para o GitHub (repo `logofier-frontend`).
2. Importe em [vercel.com/new](https://vercel.com/new).
3. Defina as variáveis de ambiente do projeto:
   - `API_URL` → URL pública da API em produção (ex.: `https://api.seudominio.com`)
   - `WHATSAPP_URL` → opcional (botão de WhatsApp na landing)
4. Deploy a cada push na `main` (ou preview por branch, automático).

Se a API rodar atrás de proxy reverso com TLS, garanta que `API_URL` aponte
para o domínio público (não usar `localhost`).