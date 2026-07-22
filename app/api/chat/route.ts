import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é o **Assistente de Gestão DD (Drivers Day)** — uma IA analítica integrada ao painel gerencial da operação de reativação de motoristas.

## Seu papel
- Responder perguntas gerenciais sobre a operação com base nos dados fornecidos.
- Sempre usar os DADOS REAIS que receber no contexto — nunca inventar números.
- Dar respostas objetivas, com números e porcentagens quando possível.
- Ao final de cada resposta, incluir uma seção "💡 Sugestões de ação" com 2-3 recomendações assertivas e práticas.

## Contexto da operação
- A equipe faz contato com motoristas inativos (drivers) para reativá-los na plataforma Shopee.
- Cada analista trata drivers por telefone/WhatsApp.
- Os drivers pertencem a HUBs (regiões).
- Métricas-chave: SLA, média de atendimentos/dia, conversão, total de disparos, GAP.
- Semanas são identificadas como "Week-XX".

## Regras de resposta
1. Responda SEMPRE em português do Brasil.
2. Use formatação com **negrito**, listas e números.
3. Quando não tiver dados suficientes, diga claramente.
4. Sempre encerre com sugestões de ação concretas.
5. Seja direto e executivo.
6. Compare com médias quando possível.`;

function prepararContextoDados(data: unknown): string {
  const partes: string[] = [];
  const d = (typeof data === 'object' && data !== null) ? data as Record<string, unknown> : {};

  const resumo = d.resumo as Record<string, unknown> | undefined;
  if (resumo) {
    partes.push(`## Resumo Geral
- Média Atend/Dia/Analista: ${String(resumo.mediaAtendimentos ?? "N/D")}
- Total Atendimentos: ${String(resumo.totalAtendimentos ?? "N/D")}
- SLA: ${String(resumo.sla ?? "N/D")}
- Analistas: ${String(resumo.totalAnalistas ?? "N/D")}
- Semanas: ${String(resumo.totalSemanas ?? "N/D")}
- HUBs: ${String(resumo.totalHubs ?? "N/D")}`);
  }

  const analistas = Array.isArray(d.analistas) ? d.analistas as unknown[] : [];
  if (analistas.length > 0) {
    partes.push(`\n## Analistas (${analistas.length})`);
    analistas.forEach((a, i) => {
      const ra = (typeof a === 'object' && a !== null) ? a as Record<string, unknown> : {};
      partes.push(`${i+1}. **${String(ra.nome ?? '')}** — ${String(ra.totalAtend ?? '')} atend, ${String(ra.atendDia ?? '')}/dia, ${String(ra.pctTotal ?? '')}, ${String(ra.status ?? '')}, ${String(ra.tempoEfetivo ?? '')}`);
    });
  }

  const hubs = Array.isArray(d.hubs) ? d.hubs as unknown[] : [];
  if (hubs.length > 0) {
    partes.push(`\n## HUBs (${hubs.length})`);
    hubs.forEach((h) => {
      const rh = (typeof h === 'object' && h !== null) ? h as Record<string, unknown> : {};
      partes.push(`- **${String(rh.hub ?? '')}**: ${String(rh.totalAtend ?? '')} atend, ${String(rh.pctTotal ?? '')}, ${String(rh.status ?? '')}, ${String(rh.analise ?? '')}`);
    });
  }

  const semanas = Array.isArray(d.semanas) ? d.semanas as unknown[] : [];
  if (semanas.length > 0) {
    partes.push(`\n## Semanas (${semanas.length})`);
    semanas.forEach((s) => {
      const rs = (typeof s === 'object' && s !== null) ? s as Record<string, unknown> : {};
      partes.push(`- **${String(rs.semana ?? '')}**: ${String(rs.numAtend ?? '')} atend, ${String(rs.pctTotal ?? '')}, GAP: ${String(rs.gap ?? '')}, ${String(rs.status ?? '')}`);
    });
  }

  const motoristas = Array.isArray(d.motoristas) ? d.motoristas as unknown[] : [];
  if (motoristas.length > 0) {
    const total = motoristas.length;
    const statusCount: Record<string, number> = {};
    const hubCount: Record<string, number> = {};
    motoristas.forEach((m) => {
      const rm = (typeof m === 'object' && m !== null) ? m as Record<string, unknown> : {};
      const st = String(rm.status ?? rm.Status ?? "Sem status");
      const hb = String(rm.hub ?? rm.Hub ?? "Sem hub");
      statusCount[st] = (statusCount[st] || 0) + 1;
      hubCount[hb] = (hubCount[hb] || 0) + 1;
    });
    partes.push(`\n## Motoristas (Total: ${total})`);
    partes.push(`### Por Status:`);
    Object.entries(statusCount).sort((a,b) => b[1]-a[1]).forEach(([st, qtd]) => {
      partes.push(`- ${st}: ${qtd} (${((qtd/total)*100).toFixed(1)}%)`);
    });
    partes.push(`### Por HUB (top 10):`);
    Object.entries(hubCount).sort((a,b) => b[1]-a[1]).slice(0,10).forEach(([hb, qtd]) => {
      partes.push(`- ${hb}: ${qtd}`);
    });
  }
  return partes.join("\n") || "Nenhum dado disponível.";
}

export async function POST(req: NextRequest) {
  try {
    // 1. Buscando a chave correta salva na Vercel (GROQ_API_KEY)
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY não configurada no Vercel." },
        { status: 500 }
      );
    }

    // URL oficial do chat completions da Groq
    const url = "https://api.groq.com/openai/v1/chat/completions";

    const body = await req.json();
    const { question, data, history } = body as { question?: string; data?: unknown; history?: unknown };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Pergunta vazia." }, { status: 400 });
    }

    const contextoDados = prepararContextoDados(data || {});
    
    // Mapeamento do histórico para o padrão clássico da API da OpenAI/Groq
    const histArr = Array.isArray(history) ? history as unknown[] : [];
    const mensagensHistorico = histArr.slice(-6).map((msg) => {
      const rm = (typeof msg === 'object' && msg !== null) ? msg as Record<string, unknown> : {};
      return {
        role: String(rm.role) === "user" ? "user" : "assistant",
        content: String(rm.content ?? ""),
      };
    });

    // Montando a requisição para a Groq
    const groqBody = {
      model: "llama-3.3-70b-versatile", // Modelo ultra-rápido e inteligente da Groq
      messages: [
        { role: "system", content: `${SYSTEM_PROMPT}\n\n# DADOS ATUAIS DA OPERAÇÃO:\n${contextoDados}` },
        ...mensagensHistorico,
        { role: "user", content: question }
      ],
      temperature: 0.3,
      max_tokens: 1024,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(groqBody),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", response.status, err);
      return NextResponse.json({ error: `Erro na API da Groq (${response.status})` }, { status: 502 });
    }

    const result = await response.json();
    const answer = result?.choices?.[0]?.message?.content || "Sem resposta. Reformule a pergunta.";

    return NextResponse.json({ answer });
  } catch (err: unknown) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}