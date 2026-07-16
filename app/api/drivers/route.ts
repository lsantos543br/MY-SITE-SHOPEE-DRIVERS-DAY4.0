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
- Status dos drivers: "First Trip Efetuada" (sucesso), "Ag. Integração/Treinamento", "Ag. First Trip", "First Trip em Atraso", "Não Compareceu", "Sem Vagas Hub".

## Regras de resposta
1. Responda SEMPRE em português do Brasil.
2. Use formatação com **negrito**, listas e números.
3. Quando não tiver dados suficientes, diga claramente.
4. Sempre encerre com sugestões de ação concretas.
5. Seja direto e executivo — o gestor quer respostas rápidas.
6. Compare com médias quando possível.`;

function prepararContextoDados(data: any): string {
  const partes: string[] = [];
  if (data.resumo) {
    partes.push(`## Resumo Geral
- Média Atend/Dia/Analista: ${data.resumo.mediaAtendimentos ?? "N/D"}
- Total Atendimentos: ${data.resumo.totalAtendimentos ?? "N/D"}
- SLA: ${data.resumo.sla ?? "N/D"}
- Analistas: ${data.resumo.totalAnalistas ?? "N/D"}
- Semanas: ${data.resumo.totalSemanas ?? "N/D"}
- HUBs: ${data.resumo.totalHubs ?? "N/D"}
- Média Atend/Dia (equipe): ${data.resumo.mediaAtendDia ?? "N/D"}
- Média/Hora/Analista: ${data.resumo.mediaHoraAnalista ?? "N/D"}
- Total Dias Úteis: ${data.resumo.totalDiasUteis ?? "N/D"}`);
  }
  if (data.analistas?.length > 0) {
    partes.push(`\n## Analistas (${data.analistas.length})`);
    data.analistas.forEach((a: any, i: number) => {
      partes.push(`${i+1}. **${a.nome}** — ${a.totalAtend} atend, ${a.atendDia}/dia, ${a.pctTotal}, ${a.status}, ${a.tempoEfetivo}`);
    });
  }
  if (data.hubs?.length > 0) {
    partes.push(`\n## HUBs (${data.hubs.length})`);
    data.hubs.forEach((h: any) => {
      partes.push(`- **${h.hub}**: ${h.totalAtend} atend, ${h.pctTotal}, ${h.status}, ${h.analise}`);
    });
  }
  if (data.semanas?.length > 0) {
    partes.push(`\n## Semanas (${data.semanas.length})`);
    data.semanas.forEach((s: any) => {
      partes.push(`- **${s.semana}**: ${s.numAtend} atend, ${s.pctTotal}, GAP: ${s.gap}, ${s.status}`);
    });
  }
  if (data.disparos?.length > 0) {
    const totalDisparos = data.disparos.length;
    partes.push(`\n## Disparos (Total: ${totalDisparos})`);
    const porSemana: Record<string, number> = {};
    data.disparos.forEach((d: any) => {
      const sem = d.semana || "Sem semana";
      porSemana[sem] = (porSemana[sem] || 0) + 1;
    });
    Object.entries(porSemana).sort((a,b) => b[1]-a[1]).slice(0,10).forEach(([sem, qtd]) => {
      partes.push(`- ${sem}: ${qtd} disparos`);
    });
  }
  if (data.motoristas?.length > 0) {
    const total = data.motoristas.length;
    const statusCount: Record<string, number> = {};
    const hubCount: Record<string, number> = {};
    const analistaCount: Record<string, number> = {};
    data.motoristas.forEach((m: any) => {
      const st = m.status || m.Status || "Sem status";
      const hb = m.hub || m.Hub || "Sem hub";
      const an = m.analyst || m.analista || "Sem analista";
      statusCount[st] = (statusCount[st] || 0) + 1;
      hubCount[hb] = (hubCount[hb] || 0) + 1;
      analistaCount[an] = (analistaCount[an] || 0) + 1;
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
    partes.push(`### Por Analista:`);
    Object.entries(analistaCount).sort((a,b) => b[1]-a[1]).forEach(([an, qtd]) => {
      partes.push(`- ${an}: ${qtd}`);
    });
  }
  return partes.join("\n") || "Nenhum dado disponível.";
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY não configurada no Vercel." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { question, data, history } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "Pergunta vazia." }, { status: 400 });
    }

    const contextoDados = prepararContextoDados(data || {});

    // Montar mensagens no formato OpenAI (Groq usa o mesmo formato)
    const messages: any[] = [
      {
        role: "system",
        content: `${SYSTEM_PROMPT}\n\n---\n\n# DADOS ATUAIS DA OPERAÇÃO:\n\n${contextoDados}\n\n---\n\nResponda com dados reais e sugestões de ação.`,
      },
    ];

    // Adicionar histórico (últimas 6 mensagens)
    if (history?.length > 0) {
      history.slice(-6).forEach((msg: any) => {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        });
      });
    }

    // Adicionar pergunta atual
    messages.push({ role: "user", content: question });

    // Chamar Groq API (formato OpenAI-compatible)
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.4,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq error:", response.status, err);
      return NextResponse.json(
        { error: `Erro Groq (${response.status})` },
        { status: 502 }
      );
    }

    const result = await response.json();
    const answer =
      result?.choices?.[0]?.message?.content ||
      "Sem resposta. Reformule a pergunta.";

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("Chat API error:", err);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
