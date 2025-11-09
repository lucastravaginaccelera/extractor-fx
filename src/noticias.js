import OpenAI from 'openai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as deepl from 'deepl-node';
import dotenv from 'dotenv';

puppeteer.use(StealthPlugin());

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const translator = new deepl.Translator(process.env.DEEPL_API_KEY || 'c34e60f9-4781-424f-94fc-5e811ff84703:fx');

export async function buscarNoticiasFinancialJuice() {
  try {
    const url = 'https://live.financialjuice.com/FJService.asmx/GetPreviousNews?info=%22EAAAAPlLgOfsXx5398GdgRXvxRS13GuQP31g4Ck5%2F2OtzbQ%2BOscVgrmlpICl603ky%2Bz5lQ59q6msT%2BfDtJM6Hd6eU9%2Fa%2B3ipyd%2FE1sZ2Gf8Cq5ZUeDc%2BAiLgN7f56X2aN4P737znaiosEacMqY8i8KjWTC2n0GZ6Qa%2F3%2ByaWmHdPCFwun5IVflGbmupkdMYt%2Fpq0vTNTpkJFmnWy5qwyzVtRurG4SgmHFdgxtqPYKJUC%2FLn9BbSqTEcMFYJgggAgZyIb3fbuDBeL3BMNOkyCNf2C4iOF%2Bh5mnbwxQYr9Gw%2F5vOP7%22&TimeOffset=-3&tabID=0&oldID=0&TickerID=0&FeedCompanyID=0&strSearch=%22%22&extraNID=0';
    
    console.log('🔍 Chamando API Financial Juice...');
    
    const { data } = await axios.get(url, {
      headers: {
        'accept': 'application/json, text/javascript, */*; q=0.01',
        'content-type': 'application/json; charset=utf-8',
        'origin': 'https://feed.financialjuice.com',
        'referer': 'https://feed.financialjuice.com/',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1'
      }
    });

    console.log('✅ Resposta recebida');
    
    const newsArray = JSON.parse(data.d);
    
    if (!Array.isArray(newsArray)) {
      console.error('❌ Resposta não é array, conteúdo:', JSON.stringify(newsArray).substring(0, 200));
      return [];
    }
    
    console.log(`📰 ${newsArray.length} notícias encontradas na API`);
    
    // Buscar notícia mais importante (Breaking ou primeira)
    let noticiaImportante = newsArray.find(item => item.Breaking) || newsArray[0];
    
    if (!noticiaImportante) {
      console.log('⚠️  Nenhuma notícia disponível');
      return [];
    }
    
    // Traduzir título para português
    const tituloTraduzido = await translator.translateText(noticiaImportante.Title, null, 'pt-BR');
    
    const item = noticiaImportante;
    const breaking = item.Breaking;
    const level = item.Level || '';
    
    let importancia = 'Média';
    if (breaking) importancia = 'Alta';
    else if (level.includes('important') || level.includes('high')) importancia = 'Alta';
    else if (level.includes('low')) importancia = 'Baixa';
    
    const noticia = {
      titulo: tituloTraduzido.text,
      tituloOriginal: item.Title,
      link: item.EURL,
      resumo: item.Description || item.Title,
      hora: item.PostedShort,
      data: item.PostedLong,
      labels: item.Labels || [],
      breaking: breaking,
      importancia: importancia,
      impacto: 'Neutro',
      moedas: item.Labels.filter(l => l.includes('USD') || l.includes('EUR') || l.includes('GBP'))
    };

    console.log(`✅ Notícia mais importante processada e traduzida`);
    return [noticia];
  } catch (error) {
    console.error('❌ Erro ao buscar notícias Financial Juice:', error.message);
    console.error('Stack:', error.stack);
    return [];
  }
}

export async function gerarNoticiasForex() {
  console.log('🔍 Buscando notícias do Financial Juice...');
  const noticias = await buscarNoticiasFinancialJuice();
  
  if (noticias.length === 0) {
    console.log('⚠️  Nenhuma notícia encontrada');
    return null;
  }

  console.log(`✅ ${noticias.length} notícias encontradas`);
  return noticias;
}

export async function analisarNoticia(texto) {
  if (!process.env.OPENAI_API_KEY) {
    return 'OpenAI não configurada';
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um analista Forex. Analise notícias e explique o impacto no mercado de câmbio de forma clara e objetiva."
        },
        {
          role: "user",
          content: `Analise esta notícia e explique o impacto no mercado Forex:\n\n${texto}`
        }
      ],
      temperature: 0.6,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Erro ao analisar notícia:', error.message);
    return null;
  }
}
