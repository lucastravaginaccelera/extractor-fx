# Deploy na VPS

## Pré-requisitos

- Docker instalado
- Docker Compose instalado

## Instalação do Docker (Ubuntu/Debian)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

## Deploy

1. **Clone o repositório na VPS:**
```bash
git clone <seu-repo>
cd extractor-fx
```

2. **Configure o arquivo .env:**
```bash
cp .env.example .env
nano .env
```

Preencha:
```
TELEGRAM_BOT_TOKEN=seu_token
TELEGRAM_CHAT_ID=seu_chat_id
OPENAI_API_KEY=sua_chave
DEEPL_API_KEY=sua_chave_deepl
PORT=3000
```

3. **Execute o deploy:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## Comandos Úteis

**Ver logs:**
```bash
docker-compose logs -f
```

**Parar:**
```bash
docker-compose down
```

**Reiniciar:**
```bash
docker-compose restart
```

**Ver status:**
```bash
docker-compose ps
```

**Atualizar código:**
```bash
git pull
docker-compose up -d --build
```

## Horários Programados

O sistema roda automaticamente:

**Calendário Econômico:**
- 08:00 - Envio matinal
- 18:00 - Envio noturno

**Curiosidades Forex:**
- 09:00 - Manhã
- 14:00 - Tarde
- 20:00 - Noite

**Notícias Forex:**
- 10:00 - Manhã
- 16:00 - Tarde

## Monitoramento

**Health check:**
```bash
curl http://localhost:3000/health
```

**Testar endpoints manualmente:**
```bash
curl -X POST http://localhost:3000/api/enviar-telegram
curl -X POST http://localhost:3000/api/enviar-curiosidades
curl -X POST http://localhost:3000/api/enviar-noticias
```
