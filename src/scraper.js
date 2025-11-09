import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function scrapeCalendarioEconomico() {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled'
    ]
  });
  
  const page = await browser.newPage();
  
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  });
  
  try {
    await page.goto('https://sslecal2.investing.com?columns=exc_flags,exc_currency,exc_importance,exc_actual,exc_forecast,exc_previous&importance=2,3&features=datepicker,timezone&countries=110,17,29,25,32,6,37,26,5,22,39,14,48,10,35,7,43,38,4,36,12,72&calType=day&timeZone=12&lang=12', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    await page.waitForTimeout(5000);

    const eventos = await page.evaluate(() => {
      const data = [];
      let currentDate = '';

      const allRows = document.querySelectorAll('table.genTable tr, table tr');
      
      allRows.forEach(row => {
        const rowText = row.textContent || '';
        const firstCell = row.querySelector('td');
        
        if (firstCell && firstCell.colSpan > 1 && rowText.includes('de')) {
          currentDate = rowText.trim();
        }
        
        if (row.id && row.id.startsWith('eventRowId_')) {
          const cells = row.querySelectorAll('td');
          const timeEl = row.querySelector('td.time');
          const currencyEl = row.querySelector('td.flagCur');
          const eventEl = row.querySelector('td.event a, td.event');
          const importanceCell = row.querySelector('td.sentiment, td[class*="imp"]');
          const importanceIcons = importanceCell ? importanceCell.querySelectorAll('i.grayFullBullishIcon') : [];
          
          let actual = '', forecast = '', previous = '';
          cells.forEach(cell => {
            const cellClass = cell.className || '';
            if (cellClass.includes('act') || cell.id === 'actual') actual = cell.textContent.trim();
            if (cellClass.includes('fore') || cell.id === 'forecast') forecast = cell.textContent.trim();
            if (cellClass.includes('prev') || cell.id === 'previous') previous = cell.textContent.trim();
          });

          if (eventEl) {
            data.push({
              data: currentDate,
              hora: timeEl?.textContent.trim() || '',
              moeda: currencyEl?.textContent.trim() || '',
              importancia: importanceIcons.length,
              evento: eventEl.textContent.trim(),
              atual: actual,
              previsao: forecast,
              anterior: previous
            });
          }
        }
      });

      return data;
    });

    return eventos;
  } finally {
    await browser.close();
  }
}
