import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { question, data, history } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Chave da OpenAI não configurada no servidor." }, { status: 500 });
    }

    // 1. Montamos o contexto do Beacon DD4.0 para o ChatGPT
    const systemPrompt = `
      Você é o Beacon DD4.0, uma inteligência artificial assistente e co-piloto de Gestão de Frota do Drivers Day da Shopee.
      
      Aqui estão os dados atuais da operação em tempo real:
      ${JSON.stringify(data)}

      Instruções importantes:
      - Seja direto, profissional e focado em logística/frota.
      - Use os dados reais acima para responder às perguntas.
      - Responda em português brasileiro.
    `;

    // 2. Preparamos as mensagens no formato da OpenAI
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...history.map((h: any) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: h.content,
      })),
      { role: "user", content: question }
    ];

    // 3. Fazemos a chamada para a API oficial do ChatGPT
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // O modelo mais rápido, inteligente e incrivelmente barato da OpenAI
        messages: apiMessages,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Erro na chamada da OpenAI");
    }

    const responseData = await response.json();
    const answer = responseData.choices[0].message.content;

    return NextResponse.json({ answer });

  } catch (error: any) {
    console.error("Erro na rota do ChatGPT:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno no servidor do ChatGPT" },
      { status: 500 }
    );
  }
}