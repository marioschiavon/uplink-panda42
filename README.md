# WPPConnect Console

Painel SaaS moderno para gerenciar conexões WhatsApp via WPPConnect, construído com React + TypeScript + Vite.

![Stack](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-green)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)

## 🚀 Features

- ✅ **Autenticação Local** via sessionStorage
- ✅ **Conexão WhatsApp** via QR Code em tempo real
- ✅ **Socket.IO** para updates em tempo real
- ✅ **Zustand** para state management
- ✅ **Dark/Light Mode** com next-themes
- ✅ **Layout SaaS** estilo Vercel Dashboard
- ✅ **shadcn/ui** components
- ✅ **Tailwind CSS** com design system customizado
- ✅ **Bridge Server** Node.js incluído
- ✅ **Docker** ready para produção
- ✅ **Campanhas** de envio em massa
- ✅ **Templates** com variáveis dinâmicas
- ✅ **Métricas** e dashboard de uso
- ✅ **Planos** com limites configuráveis
- ✅ **Configurações** exportação/importação JSON

## Project info

**URL**: https://lovable.dev/projects/9b8b54e6-4e6b-4df9-95d8-22491a680c61

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9b8b54e6-4e6b-4df9-95d8-22491a680c61) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 📁 Estrutura do Projeto

```
.
├── src/                    # Frontend React + Vite
│   ├── api/               # Clientes HTTP
│   ├── components/        # Componentes React
│   ├── hooks/             # Custom hooks (useWppSocket)
│   ├── lib/               # Axios, Socket.IO config
│   ├── pages/             # Rotas (Dashboard, Messages)
│   ├── store/             # Zustand stores
│   └── README.md          # Documentação frontend
│
└── bridge/                # Backend Node.js + Express
    ├── src/
    │   ├── routes/        # REST API endpoints
    │   ├── socket/        # Socket.IO manager
    │   ├── services/      # WPPConnect client
    │   ├── middlewares/   # Auth Bearer token
    │   └── utils/         # Logger (Pino)
    └── README.md          # Documentação backend
```

## 🛠️ Tech Stack

### Frontend
- React 18.3
- TypeScript 5.3
- Vite 5.x
- React Router 6.30
- Zustand 5.0
- Axios 1.12
- Socket.IO Client 4.8
- shadcn/ui (Radix UI)
- Tailwind CSS 3.x
- next-themes 0.3

### Backend (Bridge)
- Node.js 18+
- TypeScript 5.3
- Express 4.18
- Socket.IO 4.6
- Axios 1.6
- Pino (logger)
- Helmet (security)

## How can I deploy this project?

### Deploy com Lovable (Mais Rápido)

Simply open [Lovable](https://lovable.dev/projects/9b8b54e6-4e6b-4df9-95d8-22491a680c61) and click on Share -> Publish.

### Deploy com Docker (Produção)

Para deploy em produção usando Docker, siga o guia completo em [DEPLOY.md](./DEPLOY.md).

**Quick Start:**

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# 2. Build e execute com Docker Compose
docker-compose up -d

# 3. Acesse a aplicação
# Panel: http://localhost
# Bridge API: http://localhost:3001
# Health Check: http://localhost:3001/api/health
```

**Verificar Status:**

```bash
# Verificar containers rodando
docker-compose ps

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

**Recursos do Deploy:**

- ✅ Dockerfile para painel (frontend)
- ✅ Dockerfile para bridge (backend)
- ✅ docker-compose.yml completo
- ✅ Health checks configurados
- ✅ Nginx otimizado
- ✅ Restart automático
- ✅ Guia completo de troubleshooting

Consulte [DEPLOY.md](./DEPLOY.md) para:
- Deploy em produção com SSL/TLS
- Configuração de proxy reverso
- Monitoramento e logs
- Troubleshooting
- Backup e restauração

## 🔌 Arquitetura

```
React Frontend <---> Bridge Server <---> WPPConnect <---> WhatsApp Web
  (Socket.IO)        (REST + WS)         (HTTP)
```

### Fluxo de Conexão

1. Frontend clica "Iniciar Sessão" → POST /api/sessions/start
2. Bridge Server → WPPConnect start-session
3. WPPConnect gera QR Code
4. Bridge emite evento `session:qrcode` via Socket.IO
5. Frontend exibe QR Code
6. Usuário escaneia no WhatsApp
7. WPPConnect confirma → Bridge emite `session:connected`
8. Frontend atualiza status para "Conectado"

## ⚙️ Configuração

### Frontend (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
VITE_APP_NAME=WPPConnect Console
```

### Backend (`bridge/.env`)
```env
WPP_API_URL=https://seu-servidor-wppconnect:21465
PANEL_TOKEN=seu-token-seguro-aqui
PORT=3001
NODE_ENV=development
PANEL_URL=http://localhost:5173
```

## 🚀 Iniciar Projeto

**Terminal 1 - Frontend:**
```bash
npm install
npm run dev
```

**Terminal 2 - Bridge Server:**
```bash
cd bridge
npm install
npm run dev
```

Acesse: http://localhost:5173

## 📚 Documentação

- [Frontend README](./src/README.md) - Detalhes do React app
- [Bridge README](./bridge/README.md) - Detalhes do servidor Node.js
- [WPPConnect Docs](https://github.com/wppconnect-team/wppconnect)

## 🎨 Customização de Cores

Paleta FlowDesk by Panda42 em `src/index.css`:

```css
:root {
  --primary: 142 76% 55%;      /* Verde-lima #22C55E */
  --secondary: 237 61% 60%;    /* Violeta #6366F1 */
  --background: 220 14% 6%;    /* Fundo #0E0E11 */
}
```

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

Feito com ❤️ usando [Lovable](https://lovable.dev)
