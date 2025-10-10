# 🚀 Guia de Deploy - WPPConnect Panel

Este guia fornece instruções detalhadas para fazer o deploy do WPPConnect Panel em diferentes ambientes.

## 📋 Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- Servidor WPPConnect em execução
- Porta 80 (painel) e 3001 (bridge) disponíveis

## 🐳 Deploy com Docker Compose (Recomendado)

### 1. Configuração Inicial

Clone o repositório e navegue até o diretório:

```bash
git clone <seu-repositorio>
cd wppconnect-panel
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# URL do servidor WPPConnect
WPP_API_URL=http://seu-servidor:21465

# Chave de API do WPPConnect (se necessário)
WPP_API_KEY=sua-chave-api

# Nome da aplicação
VITE_APP_NAME=WPPConnect Panel
```

### 3. Build e Execução

Execute o seguinte comando para construir e iniciar os containers:

```bash
docker-compose up -d
```

Isso irá:
- Construir a imagem do painel (frontend)
- Construir a imagem do bridge (backend)
- Iniciar ambos os serviços
- Configurar a rede entre eles

### 4. Verificar Status

Verifique se os containers estão rodando:

```bash
docker-compose ps
```

Verifique os logs:

```bash
# Logs do painel
docker-compose logs -f panel

# Logs do bridge
docker-compose logs -f bridge
```

### 5. Acessar a Aplicação

- **Painel**: http://localhost
- **Bridge API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 🔧 Deploy Manual (sem Docker)

### Panel (Frontend)

```bash
# Instalar dependências
npm install

# Build da aplicação
npm run build

# Servir com nginx ou outro servidor web
# Os arquivos estarão em ./dist
```

### Bridge (Backend)

```bash
cd bridge

# Instalar dependências
npm install

# Build do TypeScript
npm run build

# Iniciar o servidor
npm start
```

## 🌐 Deploy em Produção

### Usando Nginx como Proxy Reverso

Exemplo de configuração do Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Redirecionar para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Panel (Frontend)
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Bridge API
    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # WebSocket para Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

### Configuração com SSL/TLS

Para produção, sempre use HTTPS. Você pode usar Let's Encrypt:

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

## 🔒 Segurança

### Recomendações de Segurança

1. **Use HTTPS em produção**
2. **Configure CORS adequadamente** no bridge
3. **Use secrets** para chaves de API (não commite no repositório)
4. **Configure firewall** para limitar acesso às portas
5. **Atualize regularmente** as dependências

### Variáveis de Ambiente Sensíveis

Nunca commite arquivos `.env` no repositório. Use um arquivo `.env.example`:

```bash
# .env.example
WPP_API_URL=http://localhost:21465
WPP_API_KEY=
VITE_APP_NAME=WPPConnect Panel
```

## 📊 Monitoramento

### Health Checks

O bridge possui um endpoint de health check:

```bash
curl http://localhost:3001/api/health
```

Resposta esperada:
```json
{
  "status": "ok",
  "timestamp": "2025-04-07T12:00:00.000Z"
}
```

### Logs

Para visualizar logs em tempo real:

```bash
# Docker Compose
docker-compose logs -f

# Logs específicos
docker-compose logs -f bridge
docker-compose logs -f panel
```

## 🔄 Atualização

Para atualizar a aplicação:

```bash
# Parar os containers
docker-compose down

# Atualizar código
git pull

# Rebuild e reiniciar
docker-compose up -d --build
```

## 🛠️ Troubleshooting

### Erro: "Connection refused"

Verifique se o bridge está rodando e acessível:

```bash
curl http://localhost:3001/api/health
```

### Erro: "CORS blocked"

Adicione sua URL no arquivo `bridge/src/index.ts`:

```typescript
const io = new Server(httpServer, {
  cors: {
    origin: ['http://seu-dominio.com'],
    methods: ['GET', 'POST'],
  },
});
```

### Container não inicia

Verifique os logs:

```bash
docker-compose logs bridge
docker-compose logs panel
```

### Porta já em uso

Altere as portas no `docker-compose.yml`:

```yaml
services:
  panel:
    ports:
      - "8080:80"  # Usar porta 8080 ao invés de 80
```

## 📝 Manutenção

### Backup

Exporte as configurações pela interface:
1. Acesse **Configurações** > **Configurações Gerais**
2. Clique em **Exportar Configurações**
3. Salve o arquivo JSON em local seguro

### Restauração

Para restaurar:
1. Acesse **Configurações** > **Configurações Gerais**
2. Clique em **Importar Configurações**
3. Selecione o arquivo JSON de backup

## 📞 Suporte

Para problemas ou dúvidas:
- Abra uma issue no GitHub
- Consulte a documentação do WPPConnect
- Entre em contato com a equipe de suporte

## 📄 Licença

Este projeto está sob a licença MIT.
