# Testando o Sistema de Tickets

## Pré-requisitos

1. **Banco de dados criado** com as tabelas necessárias
2. **Bridge backend** rodando (`cd bridge && npm run dev`)
3. **Frontend** rodando (`npm run dev`)
4. **Socket.IO** configurado corretamente

## Passo 1: Verificar Banco de Dados

Execute no Supabase SQL Editor:

```sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('companies', 'users', 'tickets');

-- Criar empresa de teste
INSERT INTO public.companies (id, name, routing_mode)
VALUES ('company-123', 'Empresa Teste', 'hybrid')
ON CONFLICT (id) DO UPDATE SET routing_mode = 'hybrid';

-- Criar usuário agente de teste
INSERT INTO public.users (id, company_id, email, name, role, status)
VALUES 
  ('user-123', 'company-123', 'agente@teste.com', 'Agente Teste', 'agent', 'active')
ON CONFLICT (id) DO NOTHING;
```

## Passo 2: Configurar Variáveis de Ambiente

### Bridge Backend (.env)

```env
PORT=3001
PANEL_URL=http://localhost:5173

SUPABASE_URL=https://kfsvpbujmetlendgwnrs.supabase.co
SUPABASE_KEY=sua-anon-key
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

## Passo 3: Testar Backend

### 3.1 Health Check

```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T..."
}
```

### 3.2 Criar Ticket Manual (modo manual)

```bash
curl -X POST http://localhost:3001/api/tickets/auto-route \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "companyId": "company-123",
    "customerNumber": "5511999999999",
    "lastMessage": "Olá, preciso de ajuda!"
  }'
```

Resposta esperada (modo manual):
```json
{
  "ticket": {
    "id": "ticket-uuid",
    "status": "waiting",
    "assigned_to": null,
    ...
  },
  "routed": false
}
```

### 3.3 Atribuir Ticket

```bash
curl -X POST http://localhost:3001/api/tickets/assign/ticket-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "agentId": "user-123"
  }'
```

### 3.4 Fechar Ticket

```bash
curl -X POST http://localhost:3001/api/tickets/close/ticket-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token"
```

## Passo 4: Testar Frontend

### 4.1 Acessar Página de Tickets

1. Faça login no sistema
2. Navegue para `/tickets`
3. Você deve ver:
   - **Estatísticas** no topo (Na Fila, Em Atendimento, Finalizados)
   - **Seletor de Modo** de roteamento
   - **Meus Atendimentos** (coluna esquerda)
   - **Fila de Espera** (coluna direita, se modo manual/hybrid)

### 4.2 Testar Modo Manual

1. Selecione "Manual" no seletor
2. Crie um ticket via API (comando acima)
3. Ticket deve aparecer em "Fila de Espera"
4. Clique em "Assumir"
5. Ticket deve mover para "Meus Atendimentos"
6. Status muda para "Em Atendimento"

### 4.3 Testar Modo Automático

1. Selecione "Automático" no seletor
2. Crie um ticket via API
3. Ticket deve ser atribuído automaticamente
4. Chat deve abrir automaticamente (se você for o agente)
5. Fila de espera não deve aparecer

### 4.4 Testar Modo Híbrido

**Com agente livre:**
1. Selecione "Híbrido"
2. Certifique-se de que você não tem atendimentos ativos
3. Crie ticket via API
4. Ticket deve ser atribuído automaticamente

**Sem agente livre:**
1. Tenha pelo menos 1 atendimento ativo
2. Crie novo ticket
3. Ticket deve ir para fila de espera

## Passo 5: Testar Socket.IO

### 5.1 Abrir Console do Navegador

No Chrome DevTools (F12), vá para Console.

### 5.2 Verificar Conexão

Você deve ver:
```
🎫 New ticket: { id: "...", ... }
✅ Ticket assigned: { id: "...", ... }
```

### 5.3 Testar em Múltiplas Abas

1. Abra duas abas com `/tickets`
2. Em uma aba, assuma um atendimento
3. Na outra aba, o ticket deve sumir da fila em tempo real
4. Estatísticas devem atualizar em ambas

## Passo 6: Testar Finalização

1. Clique no "X" de um atendimento ativo
2. Ticket deve sumir de "Meus Atendimentos"
3. Toast deve aparecer: "Atendimento finalizado"
4. Estatísticas devem atualizar

## Cenários de Teste

### Cenário 1: Agente Manual

1. Modo: Manual
2. Criar 3 tickets via API
3. Ver fila com 3 tickets
4. Assumir 1 ticket
5. Fila deve ter 2, "Meus Atendimentos" deve ter 1
6. Finalizar o ticket
7. "Meus Atendimentos" deve ficar vazio

### Cenário 2: Distribuição Automática

1. Modo: Automático
2. Criar 5 tickets via API rapidamente
3. Tickets devem ser distribuídos usando round-robin
4. Agente menos ocupado recebe primeiro
5. Não deve haver fila visível

### Cenário 3: Híbrido sob Carga

1. Modo: Híbrido
2. Criar 1 ticket (deve atribuir automaticamente)
3. Criar 2 tickets enquanto atende o primeiro
4. Esses 2 devem ir para fila
5. Finalizar o primeiro atendimento
6. Assumir manualmente um da fila

## Troubleshooting

### Ticket não aparece

**Sintomas:**
- API retorna sucesso mas ticket não aparece na UI

**Soluções:**
1. Verificar logs do backend: `🎫 New ticket`
2. Verificar Socket.IO conectado: veja console do navegador
3. Confirmar `companyId` correto
4. Verificar RLS policies no Supabase

### Socket.IO desconectado

**Sintomas:**
- Eventos não chegam em tempo real
- Console mostra erros de conexão

**Soluções:**
1. Verificar `VITE_SOCKET_URL` no .env
2. Confirmar backend rodando na porta correta
3. Verificar CORS no backend
4. Checar se token de auth está válido

### Atribuição automática não funciona

**Sintomas:**
- Modo automático coloca ticket na fila

**Soluções:**
1. Verificar se há agentes com `status: active`
2. Confirmar `role: agent` no banco
3. Ver logs do backend: algoritmo round-robin
4. Verificar se agente já tem muitos tickets

### Erro de autenticação

**Sintomas:**
- API retorna 401 Unauthorized

**Soluções:**
1. Verificar Bearer token no header
2. Confirmar PANEL_TOKEN no bridge .env
3. Verificar token no sessionStorage do frontend
4. Re-fazer login

## Métricas de Performance

Para avaliar o sistema:

1. **Tempo de atribuição**: < 500ms
2. **Latência Socket.IO**: < 100ms
3. **Refresh da UI**: instantâneo
4. **Round-robin justo**: tickets distribuídos igualmente

## Logs Úteis

### Backend

```bash
cd bridge
npm run dev

# Você deve ver:
# 🚀 Bridge server running on port 3001
# 📡 WPPConnect URL: ...
# 🎫 New ticket: ...
# ✅ Ticket assigned: ...
```

### Frontend (Console)

```javascript
// Ver store state
useTicketsStore.getState()

// Ver company
useTicketsStore.getState().company

// Ver tickets
useTicketsStore.getState().tickets
```

## Próximos Testes

- [ ] Stress test: 100 tickets simultâneos
- [ ] Teste de reconexão Socket.IO
- [ ] Teste com múltiplos agentes
- [ ] Teste de concorrência (2 agentes assumindo mesmo ticket)
- [ ] Teste de persistência após refresh da página
