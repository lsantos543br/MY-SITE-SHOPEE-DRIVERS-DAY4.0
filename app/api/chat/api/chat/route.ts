import { NextRequest, NextResponse } from "next/server";

// ── Gemini REST API (sem necessidade de pacote npm) ────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ── System prompt focado em gestão operacional ─────────────────────────────
const SYSTEM_PROMPT = `Você é o **Assistente de Gestão DD (Drivers Day)** — uma IA analítica integrada ao painel gerencial da operação de reativação de motoristas.

## Seu papel
- Responder perguntas gerenciais sobre a operação com base nos dados fornecidos.
- Sempre usar os DADOS REAIS que receber no contexto — nunca inventar números.
- Dar respostas objetivas, com números e porcentagens quando possível.
- Ao final de cada resposta, incluir uma seção "💡 Sugestões de ação" com 2-3 recomendações assertivas e práticas baseadas nos dados.

## Contexto da operação
- A equipe faz contato com motoristas inativos (drivers) para reativá-los na plataforma Shopee.
- Cada analista trata drivers por telefone/WhatsApp.
- Os drivers pertencem a HUBs (regiões).
- Métricas-chave: SLA, média de atendimentos/dia, conversão, total de disparos, GAP.
- Semanas são identificadas como "Week-XX".
- Status dos drivers: "First Trip Efetuada" (sucesso), "Ag. Integração/Treinamento", "Ag. First Trip", "First Trip em Atraso", "Não Compareceu", "Sem Vagas Hub".

## Regras de resposta
1. Responda SEMPRE em português do Brasil.
2. Use formatação com **negrito**, listas e números para facilitar a leitura.
3. Quando não tiver dados suficientes para responder, diga claramente e sugira o que precisa.
4. Não faça suposições — se o dado não está no contexto, diga "não tenho esse dado no momento".
5. Sempre encerre com sugestões de ação concretas e assertivas.
6. Seja direto e executivo — o gestor quer respostas rápidas.
7. Se perguntarem sobre um analista, hub ou semana específica, filtre os dados e apresente só o relevante.
8. Compare com médias quando possível (ex: "Hub X está 15% abaixo da média geral").`;

// ── Preparar resumo dos dados para o prompt ────────────────────────────────
function prepararContextoDados(data: any): string {
  const partes: string[] = [];

  // Resumo geral
  if (data.resumo) {
    partes.push(`## Resumo Geral da Operação
- Média de Atendimentos/Dia/Analista: ${data.resumo.mediaAtendimentos ?? "N/D"}
- Total de Atendimentos: ${data.resumo.totalAtendimentos ?? "N/D"}
- SLA / Eficiência: ${data.resumo.sla ?? "N/D"}
- Total de Analistas: ${data.resumo.totalAnalistas ?? "N/D"}
- Total de Semanas: ${data.resumo.totalSemanas ?? "N/D"}
- Total de HUBs: ${data.resumo.totalHubs ?? "N/D"}
- Média Atend/Dia (equipe): ${data.resumo.mediaAtendDia ?? "N/D"}
- Média/Hora/Analista: ${data.resumo.mediaHoraAnalista ?? "N/D"}
- Total Dias Úteis: ${data.resumo.totalDiasUteis ?? "N/D"}`);
  }

  // Dados de analistas
  if (data.analistas && data.analistas.length > 0) {
    partes.push(`\n## Ranking de Analistas (${data.analistas.length} analistas)`);
    data.analistas.forEach((a: any, i: number) => {
      partes.push(`${i + 1}. **${a.nome}** — Total Atend: ${a.totalAtend ?? "N/D"}, Atend/Dia: ${a.atendDia ?? "N/D"}, % Total: ${a.pctTotal ?? "N/D"}, Status: ${a.status ?? "N/D"}, Tempo Efetivo: ${a.tempoEfetivo ?? "N/D"}`);
    });
  }

  // Dados de hubs
  if (data.hubs && data.hubs.length > 0) {
    partes.push(`\n## Ranking de HUBs (${data.hubs.length} hubs)`);
    data.hubs.forEach((h: any) => {
      partes.push(`- **${h.hub}**: Total Atend: ${h.totalAtend ?? "N/D"}, % Total: ${h.pctTotal ?? "N/D"}, Status: ${h.status ?? "N/D"}, Análise: ${h.analise ?? "N/D"}`);
    });
  }

  // Dados semanais
  if (data.semanas && data.semanas.length > 0) {
    partes.push(`\n## Dados Semanais (${data.semanas.length} semanas)`);
    data.semanas.forEach((s: any) => {
      partes.push(`- **${s.semana}**: Atendimentos: ${s.numAtend ?? "N/D"}, % Total: ${s.pctTotal ?? "N/D"}, GAP: ${s.gap ?? "N/D"}, Status: ${s.status ?? "N/D"}, Análise: ${s.analise ?? "N/D"}`);
    });
  }

  // Dados de disparos
  if (data.disparos && data.disparos.length > 0) {
    const totalDisparos = data.disparos.length;
    partes.push(`\n## Disparos Realizados (Total: ${totalDisparos})`);
    const porSemana: Record<string, number> = {};
    data.disparos.forEach((d: any) => {
      const sem = d.semana || "Sem semana";
      porSemana[sem] = (porSemana[sem] || 0) + 1;
    });
    Object.entries(porSemana).sort((a, b) => b[1] - a[1]).forEach(([sem, qtd]) => {
      partes.push(`- ${sem}: ${qtd} disparos`);
    });
  }

  // Dados de motoristas (resumo agrupado)
  if (data.motoristas && data.motoristas.length > 0) {
    const total = data.motoristas.length;
    const statusCount: Record<string, number> = {};
    const hubCount: Record<string, number> = {};
    const analistaCount: Record<string, number> = {};
    const modalCount: Record<string, number> = {};

    data.motoristas.forEach((m: any) => {
      const st = m.status || m.Status || "Sem status";
      const hb = m.hub || m.Hub || "Sem hub";
      const an = m.analyst || m.analista || "Sem analista";
      const md = m.modal || m.Modal || "Sem modal";
      statusCount[st] = (statusCount[st] || 0) + 1;
      hubCount[hb] = (hubCount[hb] || 0) + 1;
      analistaCount[an] = (analistaCount[an] || 0) + 1;
      modalCount[md] = (modalCount[md] || 0) + 1;
    });

    partes.push(`\n## Motoristas / Leads (Total: ${total})`);

    partes.push(`### Por Status:`);
    Object.entries(statusCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([st, qtd]) => {
        partes.push(`- ${st}: ${qtd} (${((qtd / total) * 100).toFixed(1)}%)`);
      });

    partes.push(`### Por HUB (top 15):`);
    Object.entries(hubCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .forEach(([hb, qtd]) => {
        partes.push(`- ${hb}: ${qtd} motoristas`);
      });

    partes.push(`### Por Analista:`);
    Object.entries(analistaCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([an, qtd]) => {
        partes.push(`- ${an}: ${qtd} motoristas`);
      });

    partes.push(`### Por Modal/Veículo:`);
    Object.entries(modalCount)
      .sort((a, b) => b[1] - a[1])
      .forEach(([md, qtd]) => {
        partes.push(`- ${md}: ${qtd} (${((qtd / total) * 100).toFixed(1)}%)`);
      });
  }

  return partes.join("\n") || "Nenhum dado disponível no momento.";
}

// ── Handler POST ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key do Gemini não configurada. Adicione GEMINI_API_KEY nas variáveis de ambiente do Vercel." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { question, data, history } = body;

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json({ error: "Pergunta não pode ser vazia." }, { status: 400 });
    }

    // Montar contexto de dados
    const contextoDados = prepararContextoDados(data || {});

    // Montar histórico de conversa (últimas 6 mensagens)
    const mensagensHistorico = (history || []).slice(-6).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Montar o prompt completo
    const promptCompleto = `${SYSTEM_PROMPT}

---

# DADOS ATUAIS DA OPERAÇÃO (base para suas respostas):

${contextoDados}

---

Responda a pergunta do gestor com base nos dados acima. Seja direto, use números, e termine com sugestões de ação.`;

    // Montar request para Gemini
    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: promptCompleto }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido! Sou o Assistente de Gestão DD. Estou pronto para responder perguntas gerenciais com base nos dados da operação. Como posso ajudar?" }],
        },
        ...mensagensHistorico,
        {
          role: "user",
          parts: [{ text: question }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    };

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Erro na API Gemini (${response.status}). Verifique sua API key.` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const answer =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Não consegui gerar uma resposta. Tente reformular a pergunta.";

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar a pergunta." },
      { status: 500 }
    );
  }
}
