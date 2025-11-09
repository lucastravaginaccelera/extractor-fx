import cron from 'node-cron';
import { scrapeCalendarioEconomico } from './scraper.js';
import { enviarEventos, enviarCuriosidades, enviarNoticias } from './telegram.js';
import { gerarCuriosidadesForex } from './openai.js';
import { gerarNoticiasForex } from './noticias.js';

export function iniciarAgendamentos() {
  // Envia todo dia às 8h da manhã
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Executando envio agendado das 8h...');
    try {
      const eventos = await scrapeCalendarioEconomico();
      await enviarEventos(eventos);
    } catch (error) {
      console.error('❌ Erro no agendamento:', error.message);
    }
  });

  // Envia todo dia às 18h
  cron.schedule('0 18 * * *', async () => {
    console.log('⏰ Executando envio agendado das 18h...');
    try {
      const eventos = await scrapeCalendarioEconomico();
      await enviarEventos(eventos);
    } catch (error) {
      console.error('❌ Erro no agendamento:', error.message);
    }
  });

  // Curiosidades Forex - 3x ao dia
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Gerando curiosidades Forex (9h)...');
    try {
      const curiosidades = await gerarCuriosidadesForex();
      await enviarCuriosidades(curiosidades);
    } catch (error) {
      console.error('❌ Erro ao enviar curiosidades:', error.message);
    }
  });

  cron.schedule('0 14 * * *', async () => {
    console.log('⏰ Gerando curiosidades Forex (14h)...');
    try {
      const curiosidades = await gerarCuriosidadesForex();
      await enviarCuriosidades(curiosidades);
    } catch (error) {
      console.error('❌ Erro ao enviar curiosidades:', error.message);
    }
  });

  cron.schedule('0 20 * * *', async () => {
    console.log('⏰ Gerando curiosidades Forex (20h)...');
    try {
      const curiosidades = await gerarCuriosidadesForex();
      await enviarCuriosidades(curiosidades);
    } catch (error) {
      console.error('❌ Erro ao enviar curiosidades:', error.message);
    }
  });

  // Notícias Forex - 2x ao dia
  cron.schedule('0 10 * * *', async () => {
    console.log('⏰ Gerando notícias Forex (10h)...');
    try {
      const noticias = await gerarNoticiasForex();
      await enviarNoticias(noticias);
    } catch (error) {
      console.error('❌ Erro ao enviar notícias:', error.message);
    }
  });

  cron.schedule('0 16 * * *', async () => {
    console.log('⏰ Gerando notícias Forex (16h)...');
    try {
      const noticias = await gerarNoticiasForex();
      await enviarNoticias(noticias);
    } catch (error) {
      console.error('❌ Erro ao enviar notícias:', error.message);
    }
  });

  console.log('⏰ Agendamentos configurados:');
  console.log('   Calendário Econômico:');
  console.log('   - 08:00 - Envio matinal');
  console.log('   - 18:00 - Envio noturno');
  console.log('   Curiosidades Forex:');
  console.log('   - 09:00 - Manhã');
  console.log('   - 14:00 - Tarde');
  console.log('   - 20:00 - Noite');
  console.log('   Notícias Forex:');
  console.log('   - 10:00 - Manhã');
  console.log('   - 16:00 - Tarde');
}
