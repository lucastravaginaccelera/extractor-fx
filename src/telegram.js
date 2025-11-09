import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function enviarEventos(eventos) {
  if (!CHAT_ID || !process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️  Telegram não configurado. Configure TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID no .env');
    return;
  }

  if (eventos.length === 0) {
    console.log('📭 Nenhum evento para enviar');
    return;
  }

  let mensagem = '📊 *Calendário Econômico*\n';
  mensagem += `📅 ${eventos[0].data}\n\n`;
  
  eventos.forEach(e => {
    const stars = '⭐'.repeat(e.importancia);
    mensagem += `${stars} *${e.evento}*\n`;
    mensagem += `🕐 ${e.hora} | 💱 ${e.moeda}\n`;
    if (e.atual) mensagem += `📈 Atual: \`${e.atual}\`\n`;
    if (e.previsao) mensagem += `🎯 Previsão: \`${e.previsao}\`\n`;
    if (e.anterior) mensagem += `📉 Anterior: \`${e.anterior}\`\n`;
    mensagem += '\n';
  });

  try {
    await bot.sendMessage(CHAT_ID, mensagem, { parse_mode: 'Markdown' });
    console.log(`✅ Enviado ${eventos.length} eventos para o Telegram`);
  } catch (error) {
    console.error('❌ Erro ao enviar para Telegram:', error.message);
  }
}

export async function enviarMensagem(texto) {
  if (!CHAT_ID || !process.env.TELEGRAM_BOT_TOKEN) return;
  
  try {
    await bot.sendMessage(CHAT_ID, texto, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error.message);
  }
}

export async function enviarCuriosidades(curiosidades) {
  if (!CHAT_ID || !process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️  Telegram não configurado');
    return;
  }

  if (!curiosidades) {
    console.log('📭 Nenhuma curiosidade para enviar');
    return;
  }

  const mensagem = `💡 *Curiosidades sobre Forex*\n\n${curiosidades}`;

  try {
    await bot.sendMessage(CHAT_ID, mensagem, { parse_mode: 'Markdown' });
    console.log('✅ Curiosidades enviadas para o Telegram');
  } catch (error) {
    console.error('❌ Erro ao enviar curiosidades:', error.message);
  }
}

export async function enviarNoticias(noticias) {
  if (!CHAT_ID || !process.env.TELEGRAM_BOT_TOKEN) {
    console.log('⚠️  Telegram não configurado');
    return;
  }

  if (!noticias || noticias.length === 0) {
    console.log('📰 Nenhuma notícia para enviar');
    return;
  }

  try {
    let mensagem = '━━━━━━━━━━━━━━━━━━\n';
    mensagem += '📰 *NOTÍCIAS MERCADO*\n';
    mensagem += '📈 _Últimas Atualizações do Mercado_\n';
    mensagem += '━━━━━━━━━━━━━━━━━━\n\n';
    
    noticias.forEach((noticia, index) => {
      const breakingTag = noticia.breaking ? '🔴 ' : '';
      const importanciaEmoji = noticia.importancia === 'Alta' ? '🔥' : 
                               noticia.importancia === 'Baixa' ? '📌' : '📊';
      const moedas = noticia.moedas && noticia.moedas.length > 0 ? noticia.moedas.join(' • ') : '';
      const labels = noticia.labels && noticia.labels.length > 0 ? noticia.labels.slice(0, 3).join(' • ') : '';
      
      mensagem += `${breakingTag}${importanciaEmoji} *${noticia.titulo}*\n\n`;
      
      if (noticia.hora) {
        mensagem += `⏰ ${noticia.hora}`;
        if (noticia.importancia) mensagem += ` • ${noticia.importancia}`;
        mensagem += '\n';
      }
      
      if (moedas) {
        mensagem += `🪙 ${moedas}\n`;
      } else if (labels) {
        mensagem += `🏷️ ${labels}\n`;
      }
      
      mensagem += `\n[📖 Ler notícia completa](${noticia.link})\n`;
      
      if (index < noticias.length - 1) {
        mensagem += '\n─────────────────\n\n';
      }
    });
    
    mensagem += '\n━━━━━━━━━━━━━━━━━━\n';
    mensagem += '_Fonte: Financial Juice_';
    
    await bot.sendMessage(CHAT_ID, mensagem, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true 
    });
    console.log(`✅ ${noticias.length} notícias enviadas para o Telegram`);
  } catch (error) {
    console.error('❌ Erro ao enviar notícias:', error.message);
  }
}
