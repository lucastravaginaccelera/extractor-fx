import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function gerarCuriosidadesForex() {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️  OpenAI não configurada. Configure OPENAI_API_KEY no .env');
    return null;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em mercado Forex. Gere curiosidades interessantes e educativas sobre Forex, trading, moedas e mercado financeiro."
        },
        {
          role: "user",
          content: "Liste 10 curiosidades interessantes sobre Forex. Seja direto, use emojis e mantenha cada curiosidade em 1-2 linhas."
        }
      ],
      temperature: 0.8,
      max_tokens: 500
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('❌ Erro ao gerar curiosidades:', error.message);
    return null;
  }
}
