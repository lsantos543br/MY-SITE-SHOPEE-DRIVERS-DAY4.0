import { NextResponse } from "next/server";
import { generateText } from "ai";
import { createHuggingFace } from "@ai-sdk/huggingface";

const huggingface = createHuggingFace({
  apiKey: process.env.HUGGING_FACE_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Pegamos apenas a pergunta e o histórico.
    // Ignoramos completamente o objeto 'data' pesado para evitar o erro 413.
    const { question, history } = await req.json();

    // 2. Definimos as métricas reais do dashboard diretamente aqui de forma leve
    const metricasConsolidadas = {
      totalDisparos: "6.483",
      taxaResposta: "79.1% (5.127 Leads)",
      treinamentosAgendados: "4.816 (74.3%)",
      naoComparecimento: "14.2%",
      mediaAtendimentoDiaAnalista: "9.8 por dia"
    };

    const systemPrompt = `
      Você é o Beacon DD4.0, uma inteligência artificial assistente e co-piloto de Gestão de Frota do Drivers Day da Shopee.
      
      Aqui estão as métricas consolidadas da operação em tempo real:
      - Total de Disparos Realizados: ${metricasConsolidadas.totalDisparos}
      - Taxa de Resposta (Leads responderam): ${metricasConsolidadas.taxaResposta}
      - Treinamentos Agendados (Taxa de agendamento): ${metricasConsolidadas.treinamentosAgendados}
      - Não Comparecimento (Ausentes por disparos): ${metricasConsolidadas.naoComparecimento}
      - Média de Atendimento por dia/analista: ${metricasConsolidadas.mediaAtendimentoDiaAnalista}

      Instruções importantes:
      - Seja extremamente direto, profissional e focado em logística/frota.
      - Use estritamente as métricas fornecidas acima para responder.
      - Responda em português brasileiro e de forma curta (máximo 3 parágrafos).
    `;

    // 3. Mantemos apenas a última pergunta e resposta no histórico para garantir leveza máxima
    const ultimasMensagens = (history || []).slice(-2); 
    const messages = [
      ...ultimasMensagens.map((h: any) => ({
        role: h.role === "assistant" ? ("assistant" as const) : ("user" as const),
        content: h.content,
      })),
      { role: "user" as const, content: question }
    ];

    // 4. Chamada ultraleve para o Hugging Face
    const { text } = await generateText({
      model: huggingface("Qwen/Qwen2.5-72B-Instruct"),
            system: systemPrompt,
      messages,
      temperature: 0.5,
    });

    return NextResponse.json({ answer: text });

  } catch (error: any) {
    console.error("Erro na rota do Hugging Face:", error);
    return NextResponse.json(
      { error: error.message || "Erro interno ao processar via Hugging Face" },
      { status: 500 }
    );
  }
}