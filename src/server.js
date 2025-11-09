import express from 'express';
import dotenv from 'dotenv';
import { scrapeCalendarioEconomico } from './scraper.js';
import { enviarEventos, enviarCuriosidades, enviarNoticias } from './telegram.js';
import { iniciarAgendamentos } from './scheduler.js';
import { gerarCuriosidadesForex } from './openai.js';
import { gerarNoticiasForex, analisarNoticia } from './noticias.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let cache = { data: null, timestamp: null };
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

app.get('/api/calendario-economico', async (req, res) => {
  try {
    const now = Date.now();
    
    if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
      return res.json({ 
        source: 'cache',
        eventos: cache.data 
      });
    }

    const eventos = await scrapeCalendarioEconomico();
    cache = { data: eventos, timestamp: now };
    
    res.json({ 
      source: 'scraping',
      eventos 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao extrair dados',
      message: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/enviar-telegram', async (req, res) => {
  try {
    const eventos = await scrapeCalendarioEconomico();
    await enviarEventos(eventos);
    res.json({ 
      success: true,
      message: `${eventos.length} eventos enviados para o Telegram` 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao enviar para Telegram',
      message: error.message 
    });
  }
});

app.post('/api/enviar-curiosidades', async (req, res) => {
  try {
    const curiosidades = await gerarCuriosidadesForex();
    await enviarCuriosidades(curiosidades);
    res.json({ 
      success: true,
      curiosidades 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao gerar curiosidades',
      message: error.message 
    });
  }
});

app.post('/api/enviar-noticias', async (req, res) => {
  try {
    const noticias = await gerarNoticiasForex();
    await enviarNoticias(noticias);
    res.json({ 
      success: true,
      noticias 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao gerar notícias',
      message: error.message 
    });
  }
});

app.post('/api/analisar-noticia', async (req, res) => {
  try {
    const { texto } = req.body;
    
    if (!texto) {
      return res.status(400).json({ error: 'Texto da notícia é obrigatório' });
    }

    const analise = await analisarNoticia(texto);
    await enviarNoticias(analise);
    
    res.json({ 
      success: true,
      analise 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro ao analisar notícia',
      message: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📊 Endpoint: http://localhost:${PORT}/api/calendario-economico`);
  console.log(`📱 Endpoint Telegram: http://localhost:${PORT}/api/enviar-telegram`);
  console.log(`💡 Endpoint Curiosidades: http://localhost:${PORT}/api/enviar-curiosidades`);
  console.log(`📰 Endpoint Notícias: http://localhost:${PORT}/api/enviar-noticias`);
  console.log(`🔍 Endpoint Analisar: http://localhost:${PORT}/api/analisar-noticia`);
  
  iniciarAgendamentos();
});
