# extractor-fx

API Node.js para extrair dados do calendário econômico do Investing.com

## Instalação

```bash
npm install
```

## Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Configure as variáveis no `.env`:
```
TELEGRAM_BOT_TOKEN=seu_token_do_bot
TELEGRAM_CHAT_ID=id_do_grupo
PORT=3000
```

### Como obter o Token do Bot:
1. Fale com [@BotFather](https://t.me/botfather) no Telegram
2. Envie `/newbot` e siga as instruções
3. Copie o token fornecido

### Como obter o Chat ID:
1. Adicione o bot ao grupo
2. Envie uma mensagem no grupo
3. Acesse: `https://api.telegram.org/bot<SEU_TOKEN>/getUpdates`
4. Procure por `"chat":{"id":-123456789}`

## Uso

```bash
npm start
```

A API estará disponível em `http://localhost:3000`

## Endpoints

### GET /api/calendario-economico

Retorna os eventos econômicos do dia

### POST /api/enviar-telegram

Envia os eventos do dia para o grupo do Telegram manualmente

**Resposta:**
```json
{
  "source": "scraping",
  "eventos": [
    {
      "data": "Sexta-feira, 20 de Dezembro de 2024",
      "hora": "09:30",
      "moeda": "USD",
      "importancia": 3,
      "evento": "PIB",
      "atual": "2.8%",
      "previsao": "2.5%",
      "anterior": "2.3%"
    }
  ]
}
```

### GET /health

Verifica status da API

## Cache

Os dados são cacheados por 5 minutos para melhor performance.

## Envios Automáticos

O sistema envia automaticamente os eventos para o Telegram:
- **08:00** - Envio matinal
- **18:00** - Envio noturno

Para personalizar os horários, edite `src/scheduler.js`
