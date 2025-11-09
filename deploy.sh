#!/bin/bash

echo "🚀 Iniciando deploy do Extractor FX..."

# Parar containers existentes
echo "⏹️  Parando containers..."
docker-compose down

# Construir imagem
echo "🔨 Construindo imagem Docker..."
docker-compose build

# Iniciar containers
echo "▶️  Iniciando containers..."
docker-compose up -d

# Mostrar logs
echo "📋 Logs do container:"
docker-compose logs -f
