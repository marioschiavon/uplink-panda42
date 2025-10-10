# Migração para Supabase Externo

Este projeto foi migrado para usar um projeto Supabase externo.

## Configuração Atual

### Projeto Supabase
- **Project ID**: `kfsvpbujmetlendgwnrs`
- **URL**: `https://kfsvpbujmetlendgwnrs.supabase.co`
- **Anon Key**: Configurada em `src/integrations/supabase/custom-client.ts`

## Estrutura de Arquivos

```
src/integrations/supabase/
├── client.ts           # Cliente Lovable Cloud (auto-gerenciado - NÃO USAR)
├── custom-client.ts    # ✅ Cliente Supabase Externo (USAR ESTE)
└── types.ts           # Tipos do banco de dados
```

## Como Usar

### Importar o Cliente Supabase
```typescript
import { supabase } from "@/integrations/supabase/custom-client";
```

### Exemplo de Uso
```typescript
// Consultar dados
const { data, error } = await supabase
  .from('sua_tabela')
  .select('*');

// Inserir dados
const { data, error } = await supabase
  .from('sua_tabela')
  .insert([{ coluna: 'valor' }]);
```

## Próximos Passos

### 1. Configurar Banco de Dados
Você precisará criar as tabelas necessárias no seu projeto Supabase:

- `templates` - Para armazenar templates de mensagens
- `campaigns` - Para gerenciar campanhas
- `campaign_items` - Para itens individuais de campanhas

### 2. Configurar Row Level Security (RLS)
Crie políticas de segurança para cada tabela:

```sql
-- Exemplo: Habilitar RLS
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Users can view their own templates"
  ON templates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own templates"
  ON templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 3. Configurar Autenticação
No painel do Supabase:
1. Vá em Authentication > Settings
2. Configure os provedores de autenticação desejados
3. Configure as URLs de redirecionamento
4. **IMPORTANTE**: Habilite "Auto-confirm email" para facilitar testes

### 4. Configurar Storage (se necessário)
Se usar storage de arquivos:
1. Crie buckets no painel Supabase
2. Configure políticas de acesso para os buckets

### 5. Gerar Tipos TypeScript
Para gerar tipos atualizados do seu banco de dados:

```bash
npx supabase gen types typescript --project-id kfsvpbujmetlendgwnrs > src/integrations/supabase/types.ts
```

## Arquivos Modificados

- ✅ `src/integrations/supabase/custom-client.ts` - Cliente customizado criado
- ✅ `src/api/templates.ts` - Import atualizado
- ✅ `src/api/campaigns.ts` - Import atualizado
- ✅ `src/lib/supabase.ts` - Redirecionado para custom-client
- ✅ `supabase/config.toml` - Project ID atualizado

## Notas Importantes

⚠️ **O arquivo `client.ts` original não deve ser editado** - ele é auto-gerenciado pelo Lovable Cloud

✅ **Sempre use `custom-client.ts`** para suas operações com Supabase

🔒 **Configure RLS** em todas as tabelas para garantir segurança dos dados

📝 **Documente suas tabelas** e políticas para facilitar manutenção futura

## Suporte

Para mais informações sobre o Supabase:
- [Documentação Oficial](https://supabase.com/docs)
- [Guia de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
