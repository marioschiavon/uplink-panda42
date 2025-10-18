# WPPConnect Bridge Server

Servidor bridge Node.js + TypeScript + Express + Socket.IO para conectar o painel React ao WPPConnect.

## 📋 Requisitos

- Node.js >= 18
- npm ou yarn
- Servidor WPPConnect rodando

## 🚀 Instalação

```bash
cd bridge
npm install
```

## ⚙️ Configuração

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
WPP_API_URL=https://meu-servidor-wppconnect:21465
PANEL_TOKEN=meu-token-seguro-gerado-aqui
PORT=3001
NODE_ENV=development
PANEL_URL=http://localhost:5173
```

**Importante:** 
- `PANEL_TOKEN` deve ser o mesmo configurado no painel React
- `WPP_API_URL` deve apontar para seu servidor WPPConnect
- `PANEL_URL` define quais origens podem conectar via CORS

## 🏃 Executar

### Desenvolvimento (com hot reload)
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📡 Endpoints REST

Todos os endpoints requerem header: `Authorization: Bearer {PANEL_TOKEN}`

### Sessions

**POST** `/api/sessions/start`
```json
{
  "sessionName": "my-session"
}
```

**GET** `/api/sessions`  
Lista todas as sessões ativas

**GET** `/api/sessions/:session/status`  
Status de uma sessão específica

**POST** `/api/sessions/:session/close`  
Fecha uma sessão

### Messages

**POST** `/api/messages/send-text`
```json
{
  "session": "my-session",
  "phone": "5511999999999",
  "message": "Hello World"
}
```

**GET** `/api/messages/:session`  
Lista mensagens de uma sessão

### Tickets

**GET** `/api/tickets/waiting?companyId={uuid}`  
Retorna fila de tickets em espera

**POST** `/api/tickets/assign/:ticketId`
```json
{
  "agentId": "uuid-do-agente"
}
```
Atribui ticket manualmente a um agente

**POST** `/api/tickets/auto-route`
```json
{
  "companyId": "uuid-da-empresa",
  "customerNumber": "5511999999999",
  "lastMessage": "Olá, preciso de ajuda"
}
```
Cria e roteia ticket automaticamente com base no `routing_mode` da empresa:
- `manual`: ticket vai para fila `waiting`
- `auto`: atribui automaticamente ao agente menos ocupado
- `hybrid`: atribui se houver agente livre, senão vai para fila

**POST** `/api/tickets/close/:ticketId`  
Fecha um ticket e marca agente como disponível

## 🔌 WebSocket Events

### Client → Server

- `subscribe:session` - Inscrever-se para receber atualizações de uma sessão
- `unsubscribe:session` - Cancelar inscrição
- `subscribe:company` - Inscrever-se para receber eventos de tickets da empresa
- `unsubscribe:company` - Cancelar inscrição de eventos da empresa

### Server → Client

**Sessões:**
- `session:status` - Status atualizado da sessão
- `session:qrcode` - Novo QR code disponível
- `session:connected` - Sessão conectada com sucesso
- `session:error` - Erro na sessão
- `message:received` - Nova mensagem recebida

**Tickets:**
- `ticket:new` - Novo ticket criado
- `ticket:assigned` - Ticket atribuído a um agente
- `ticket:waiting` - Ticket adicionado à fila de espera
- `ticket:closed` - Ticket fechado

## 🏗️ Estrutura

```
bridge/
├── src/
│   ├── index.ts              # Servidor principal
│   ├── routes/
│   │   ├── wpp.ts            # Rotas REST WPPConnect
│   │   └── tickets.ts        # Rotas REST Tickets
│   ├── socket/
│   │   └── manager.ts        # Gerenciador Socket.IO
│   ├── services/
│   │   ├── wppClient.ts      # Cliente HTTP WPPConnect
│   │   ├── ticketRouter.ts   # Lógica de roteamento de tickets
│   │   └── supabaseClient.ts # Cliente Supabase
│   ├── middlewares/
│   │   └── auth.ts           # Autenticação Bearer Token
│   └── utils/
│       └── logger.ts         # Logger colorido (Pino)
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Segurança

- ✅ Todas as rotas REST validam Bearer Token
- ✅ CORS configurado para aceitar apenas o painel
- ✅ Helmet para headers de segurança
- ✅ Request logging para auditoria
- ✅ Validação de entrada em todos os endpoints

## 🐛 Debug

Logs coloridos via Pino Pretty:

```bash
# Ver todos os logs
npm run dev

# Apenas erros
LOG_LEVEL=error npm run dev

# Debug completo
LOG_LEVEL=debug npm run dev
```

## 📝 Notas de Implementação

1. **Polling de Status**: O servidor faz polling a cada 5s no WPPConnect para verificar QR codes e status de conexão. Ajuste em `socket/manager.ts` se necessário.

2. **Timeout**: Requisições ao WPPConnect têm timeout de 30s. Ajuste em `services/wppClient.ts` se necessário.

3. **WebSocket Rooms**: 
   - Cada sessão cria uma "room" no Socket.IO (`session:${sessionName}`)
   - Cada empresa cria uma "room" para eventos de tickets (`company:${companyId}`)

4. **Roteamento de Tickets**: 
   - **Manual**: Todos os tickets vão para fila `waiting`
   - **Auto**: Usa algoritmo round-robin (agente menos ocupado)
   - **Hybrid**: Auto se houver agente livre, senão vai para fila

5. **Tratamento de Erros**: Todos os erros são logados e retornam JSON estruturado com `{ error: string }`.

## 🚢 Deploy

### Docker (recomendado)

Crie um `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

Build e run:
```bash
docker build -t wppconnect-bridge .
docker run -p 3001:3001 --env-file .env wppconnect-bridge
```

### PM2

```bash
npm install -g pm2
pm2 start npm --name "wppconnect-bridge" -- start
pm2 save
pm2 startup
```

## 📚 Integrações WPPConnect

Este bridge é compatível com a API REST do WPPConnect. Endpoints mapeados:

| Bridge | WPPConnect |
|--------|------------|
| POST /api/sessions/start | POST /:session/start-session |
| GET /api/sessions/:session/status | GET /:session/status-session |
| POST /api/sessions/:session/close | POST /:session/close-session |
| POST /api/messages/send-text | POST /:session/send-message |
| GET /api/messages/:session | GET /:session/all-chats |

## 🤝 Suporte

Para dúvidas sobre:
- **WPPConnect**: https://github.com/wppconnect-team/wppconnect
- **Este Bridge**: Abra uma issue no repositório
