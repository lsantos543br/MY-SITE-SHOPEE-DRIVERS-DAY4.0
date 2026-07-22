"use client";

import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";
import AiChat from "./components/AiChat";

export default function Home() {
  const [baseMotoristas, setBaseMotoristas] = useState<any[]>([]);
const [status, setStatus] = useState("");
const [valorK2, setValorK2] = useState(0);
const [disparosRealizados, setDisparosRealizados] = useState(0);
const [disparosData, setDisparosData] = useState<{semana: string}[]>([]);
const [mediaAtendimentoAnalista, setMediaAtendimentoAnalista] = useState(9.9);

// ========================================
// DADOS DA ABA ATENDIMENTOS DD.40 — VALORES PADRÃO DA PLANILHA
// Atualizados em 22/07/2026.
// Se o Apps Script estiver implantado, esses valores são atualizados via JSONP.
// Caso contrário, esses defaults garantem que o painel funcione.
// ========================================
const [atendGerais, setAtendGerais] = useState<any>({
  totalAtendimentos: "5.356",
  totalSemanas: "16",
  totalDiasUteis: "77",
  totalAnalistas: "7",
  mediaAtendDia: "69,6",
  mediaDiaAnalista: "9,9",
  mediaHoraAnalista: "00:54",
  tempoEfetivoDia: "04h58min de 9h (55,2%)",
});
const [rankingAnalistasSheet, setRankingAnalistasSheet] = useState<any[]>([
  { posicao: "🥇 1", nome: "Jaqueline Abreu", totalAtend: "1.161", atendDia: "15,1", pctTotal: "21,70%", status: "✓ ACIMA", tempoEfetivo: "07h32min" },
  { posicao: "🥈 2", nome: "Catharina Rodrigues", totalAtend: "811", atendDia: "10,5", pctTotal: "15,10%", status: "✓ ACIMA", tempoEfetivo: "05h16min" },
  { posicao: "🥉 3", nome: "Leandro Andrade", totalAtend: "676", atendDia: "8,8", pctTotal: "12,60%", status: "✗ ABAIXO", tempoEfetivo: "04h23min" },
  { posicao: "4", nome: "Deise Vilaça", totalAtend: "642", atendDia: "8,3", pctTotal: "12,00%", status: "✗ ABAIXO", tempoEfetivo: "04h10min" },
  { posicao: "5", nome: "Leandro Menezes", totalAtend: "637", atendDia: "8,3", pctTotal: "11,90%", status: "✗ ABAIXO", tempoEfetivo: "04h08min" },
  { posicao: "6", nome: "Cassia Pereira", totalAtend: "588", atendDia: "7,6", pctTotal: "11,00%", status: "✗ ABAIXO", tempoEfetivo: "03h49min" },
  { posicao: "7", nome: "Valeria Sena", totalAtend: "575", atendDia: "7,5", pctTotal: "10,70%", status: "✗ ABAIXO", tempoEfetivo: "03h44min" },
]);
const [detalheSemanas, setDetalheSemanas] = useState<any[]>([
  { semana: "Week-30", numAtend: "150", pctTotal: "2,80%", gap: "▼ -185", status: "✗ ABAIXO", analise: "Ramp-up" },
  { semana: "Week-29", numAtend: "374", pctTotal: "7,00%", gap: "▲ +39", status: "✓ ACIMA", analise: "Acima da média" },
  { semana: "Week-28", numAtend: "402", pctTotal: "7,50%", gap: "▲ +67", status: "✓ ACIMA", analise: "Acima da média" },
  { semana: "Week-27", numAtend: "359", pctTotal: "6,70%", gap: "▲ +24", status: "✓ ACIMA", analise: "Acima da média" },
  { semana: "Week-26", numAtend: "457", pctTotal: "8,50%", gap: "▲ +122", status: "✓ ACIMA", analise: "Acima da média" },
  { semana: "Week-25", numAtend: "377", pctTotal: "7,00%", gap: "▲ +42", status: "✓ ACIMA", analise: "Acima da média" },
  { semana: "Week-24", numAtend: "524", pctTotal: "9,80%", gap: "▲ +189", status: "✓ ACIMA", analise: "Forte crescimento" },
  { semana: "Week-23", numAtend: "469", pctTotal: "8,80%", gap: "▲ +134", status: "✓ ACIMA", analise: "Acima da média" },
  { semana: "Week-22", numAtend: "1.002", pctTotal: "18,70%", gap: "▲ +667", status: "✓ ACIMA", analise: "Pico da operação" },
  { semana: "Week-21", numAtend: "751", pctTotal: "14,00%", gap: "▲ +416", status: "✓ ACIMA", analise: "Forte crescimento" },
  { semana: "Week-20", numAtend: "146", pctTotal: "2,70%", gap: "▼ -189", status: "✗ ABAIXO", analise: "Ramp-up" },
  { semana: "Week-19", numAtend: "99", pctTotal: "1,80%", gap: "▼ -236", status: "✗ ABAIXO", analise: "Ramp-up" },
  { semana: "Week-18", numAtend: "8", pctTotal: "0,10%", gap: "▼ -327", status: "✗ ABAIXO", analise: "Início da operação" },
  { semana: "Week-17", numAtend: "3", pctTotal: "0,10%", gap: "▼ -332", status: "✗ ABAIXO", analise: "Início da operação" },
  { semana: "Week-16", numAtend: "6", pctTotal: "0,10%", gap: "▼ -329", status: "✗ ABAIXO", analise: "Início da operação" },
  { semana: "Week-15", numAtend: "32", pctTotal: "0,60%", gap: "▼ -303", status: "✗ ABAIXO", analise: "Em crescimento" },
]);
const [rankingHubsSheet, setRankingHubsSheet] = useState<any[]>([
  { posicao: "🥇 1", hub: "Alvim", totalAtend: "485", pctTotal: "9,10%", status: "✓ ACIMA", analise: "Líder em volume" },
  { posicao: "🥈 2", hub: "Jurubatuba", totalAtend: "477", pctTotal: "8,90%", status: "✓ ACIMA", analise: "Líder em volume" },
  { posicao: "🥉 3", hub: "Praia Grande2", totalAtend: "406", pctTotal: "7,60%", status: "✓ ACIMA", analise: "Líder em volume" },
  { posicao: "4", hub: "Suzano", totalAtend: "368", pctTotal: "6,90%", status: "✓ ACIMA", analise: "Top performance" },
  { posicao: "5", hub: "Sao bernardo", totalAtend: "334", pctTotal: "6,20%", status: "✓ ACIMA", analise: "Top performance" },
  { posicao: "6", hub: "Osasco2", totalAtend: "283", pctTotal: "5,30%", status: "✓ ACIMA", analise: "Top performance" },
  { posicao: "7", hub: "Pq. Novo Mundo", totalAtend: "281", pctTotal: "5,20%", status: "✓ ACIMA", analise: "Acima da média" },
  { posicao: "8", hub: "Taubate", totalAtend: "280", pctTotal: "5,20%", status: "✓ ACIMA", analise: "Acima da média" },
  { posicao: "9", hub: "Guarulhos", totalAtend: "247", pctTotal: "4,60%", status: "✓ ACIMA", analise: "Acima da média" },
  { posicao: "10", hub: "Zimba", totalAtend: "220", pctTotal: "4,10%", status: "✓ ACIMA", analise: "Acima da média" },
  { posicao: "11", hub: "Santo Andre", totalAtend: "216", pctTotal: "4,00%", status: "✓ ACIMA", analise: "Acima da média" },
  { posicao: "12", hub: "Sao Jose dos Campos", totalAtend: "206", pctTotal: "3,80%", status: "✓ ACIMA", analise: "Acima da média" },
  { posicao: "13", hub: "Lapa", totalAtend: "195", pctTotal: "3,60%", status: "✗ ABAIXO", analise: "Próximo da média" },
  { posicao: "14", hub: "Barueri", totalAtend: "183", pctTotal: "3,40%", status: "✗ ABAIXO", analise: "Próximo da média" },
  { posicao: "15", hub: "Praia Grande1", totalAtend: "177", pctTotal: "3,30%", status: "✗ ABAIXO", analise: "Performance moderada" },
  { posicao: "16", hub: "Maua", totalAtend: "162", pctTotal: "3,00%", status: "✗ ABAIXO", analise: "Performance moderada" },
  { posicao: "17", hub: "Guaruja", totalAtend: "150", pctTotal: "2,80%", status: "✗ ABAIXO", analise: "Performance moderada" },
  { posicao: "18", hub: "Embu1", totalAtend: "148", pctTotal: "2,80%", status: "✗ ABAIXO", analise: "Performance moderada" },
  { posicao: "19", hub: "Embu2", totalAtend: "107", pctTotal: "2,00%", status: "✗ ABAIXO", analise: "Necessita atenção" },
  { posicao: "20", hub: "Adriana", totalAtend: "88", pctTotal: "1,60%", status: "✗ ABAIXO", analise: "Necessita atenção" },
  { posicao: "21", hub: "Carandiru", totalAtend: "80", pctTotal: "1,50%", status: "✗ ABAIXO", analise: "Necessita atenção" },
  { posicao: "22", hub: "Mooca1", totalAtend: "54", pctTotal: "1,00%", status: "✗ ABAIXO", analise: "Baixo volume" },
  { posicao: "23", hub: "Mooca2", totalAtend: "49", pctTotal: "0,90%", status: "✗ ABAIXO", analise: "Baixo volume" },
  { posicao: "24", hub: "Vila Guilherme", totalAtend: "48", pctTotal: "0,90%", status: "✗ ABAIXO", analise: "Baixo volume" },
  { posicao: "25", hub: "Guaratingueta", totalAtend: "41", pctTotal: "0,80%", status: "✗ ABAIXO", analise: "Baixo volume" },
  { posicao: "26", hub: "Itapevi", totalAtend: "38", pctTotal: "0,70%", status: "✗ ABAIXO", analise: "Baixo volume" },
  { posicao: "27", hub: "Registro", totalAtend: "27", pctTotal: "0,50%", status: "✗ ABAIXO", analise: "Baixo volume" },
]);

  // Estados dos Filtros do Dashboard
  const [filtroHub, setFiltroHub] = useState("TODOS");
  const [filtroModal, setFiltroModal] = useState("TODOS");
  const [filtroSemana, setFiltroSemana] = useState("TODOS");
  const [filtroAnalista, setFiltroAnalista] = useState("TODOS");

  // Opções dos Selects
  const [opcoesHubs, setOpcoesHubs] = useState(["TODOS"]);
  const [opcoesModais, setOpcoesModais] = useState(["TODOS"]);
  const [opcoesSemanas, setOpcoesSemanas] = useState(["TODOS"]);
  const [opcoesAnalistas, setOpcoesAnalistas] = useState(["TODOS"]);

  // Módulo de Busca e Formulário de Tratamento
  const [termoBusca, setTermoBusca] = useState("");
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<any | null>(null);

  // Campos do Formulário (Página2 - Colunas K a O)
  const [respostaK, setRespostaK] = useState("");
  const [respostaL, setRespostaL] = useState("");
  const [respostaM, setRespostaM] = useState("");
  const [respostaN, setRespostaN] = useState("");
  const [respostaO, setRespostaO] = useState("");
  const [salvandoTratamento, setSalvandoTratamento] = useState(false);

  useEffect(() => {
    // Callback JSONP para Receber os dados da Planilha (Base automatica)
    (window as any).processarDadosPlanilha = (matrizCrua: any[][]) => {
      if (Array.isArray(matrizCrua) && matrizCrua.length > 1) {
        // PARSEAR CABEÇALHO PRIMEIRO (precisa antes dos disparos)
        const cabecalho = matrizCrua[0].map(c => String(c).trim().toLowerCase());

        // CONTAGEM DE DISPAROS: Coluna L (índice 11) — presença de nome = disparo realizado
        // SEMANA DO DISPARO: Usa coluna B (Weekend) para bater com o filtro do site
        const disparosColetados: {semana: string}[] = [];
        const idxWeekendDisp = cabecalho.indexOf("weekend");
        matrizCrua.slice(1).forEach((linha) => {
          const colL = String(linha[11] || '').trim();
          if (colL !== '') {
            // Usa a mesma coluna Weekend do filtro (coluna B) — NÃO a coluna K
            const semanaDisp = idxWeekendDisp !== -1 ? String(linha[idxWeekendDisp] || '').trim() : '';
            disparosColetados.push({ semana: semanaDisp });
          }
        });
        setDisparosData(disparosColetados);
        const totalDisparos = disparosColetados.length;
        setValorK2(totalDisparos);
        setDisparosRealizados(totalDisparos);

        const idxDealDate = cabecalho.indexOf("deal date");
        const idxWeekend = cabecalho.indexOf("weekend");
        const idxHub = cabecalho.indexOf("hub");
        const idxAnalyst = cabecalho.indexOf("analyst");
        const idxDriver = cabecalho.indexOf("driver");
        const idxStatus = cabecalho.indexOf("status");
        const idxModal = cabecalho.indexOf("modal");
        const idxDriverId = cabecalho.indexOf("driver id");
        const idxTelefone = cabecalho.indexOf("telefone");
        const idxDataTreinamento = cabecalho.indexOf("data treinamento");

        const motoristasFormatados = matrizCrua.slice(1).map((linha) => {
          const statusOriginal = idxStatus !== -1 ? String(linha[idxStatus]).trim() : "";
          const possuiTreinamento =
            idxDataTreinamento !== -1 && String(linha[idxDataTreinamento]).trim() !== ""
              ? "Sim"
              : "Não";

          return {
            dealDate: idxDealDate !== -1 ? String(linha[idxDealDate]) : "",
            weekend: idxWeekend !== -1 ? String(linha[idxWeekend]) : "",
            hub: idxHub !== -1 ? String(linha[idxHub]) : "",
            analyst: idxAnalyst !== -1 ? String(linha[idxAnalyst]) : "",
            driverName: idxDriver !== -1 ? String(linha[idxDriver]) : "",
            status: statusOriginal,
            Status: statusOriginal,
            presenca: statusOriginal,
            treinado: possuiTreinamento,
            fezFirstTrip: statusOriginal,
            dataTreinamentoInput: idxDataTreinamento !== -1 ? String(linha[idxDataTreinamento]) : "",
            modal: idxModal !== -1 ? String(linha[idxModal]) : "",
            driverId: idxDriverId !== -1 ? String(linha[idxDriverId]) : "",
            telefone: idxTelefone !== -1 ? String(linha[idxTelefone]) : "",
            Hub: idxHub !== -1 ? String(linha[idxHub]) : "",
            Modal: idxModal !== -1 ? String(linha[idxModal]) : "",
            Weekend: idxWeekend !== -1 ? String(linha[idxWeekend]) : "",
            Analyst: idxAnalyst !== -1 ? String(linha[idxAnalyst]) : "",
          };
        }).filter(m => m.driverName !== "");

        setBaseMotoristas(motoristasFormatados);

        const hubsUnicos = Array.from(new Set(motoristasFormatados.map(m => m.hub).filter(Boolean))).sort();
        const modaisUnicos = Array.from(new Set(motoristasFormatados.map(m => m.modal).filter(Boolean))).sort();
        const semanasUnicas = Array.from(new Set(motoristasFormatados.map(m => m.weekend).filter(Boolean))).sort();
        const analistasUnicos = Array.from(new Set(motoristasFormatados.map(m => m.analyst).filter(Boolean))).sort();

        setOpcoesHubs(["TODOS", ...hubsUnicos]);
        setOpcoesModais(["TODOS", ...modaisUnicos]);
        setOpcoesSemanas(["TODOS", ...semanasUnicas]);
        setOpcoesAnalistas(["TODOS", ...analistasUnicos]);

        setStatus(`✅ Sincronizado com sucesso! ${motoristasFormatados.length} registros ativos.`);
      }

      const scriptConexao = document.getElementById("script-conexao-google");
      if (scriptConexao) scriptConexao.remove();
    };

    // Callback JSONP para Gravação
    (window as any).confirmarGravacaoTratamento = (resposta: any) => {
      setSalvandoTratamento(false);
      if (resposta && resposta.status === "success") {
        alert(`🎯 Sucesso! O tratamento do motorista ${resposta.driverName} foi salvo na linha ${resposta.linhaGravada} da Página2.`);
        fecharModalLimpar();
      } else {
        alert(`❌ Falha ao gravar dados: ${resposta.message || "Erro desconhecido"}`);
      }
      const scriptEnvio = document.getElementById("script-envio-google");
      if (scriptEnvio) scriptEnvio.remove();
    };

    // ============================================================
    // CALLBACK: Atendimentos DD.40 (TODAS as métricas)
    // CORRIGIDO v6: Detecção dinâmica de seções por header
    //   - Não usa índice fixo de linha (matrizMedia[5]) → resiliente
    //   - Pula coluna D (index 3) em Analistas, Semanas e Hubs
    //   - Lê coluna H (index 7) = TEMPO EFETIVO/DIA
    //
    // ⚠️ IMPORTANTE: O Apps Script DEVE retornar range A:H (8 colunas).
    //    Se retornar apenas A:G, tempoEfetivo fica vazio.
    // ============================================================
    (window as any).processarMediaAtendimentos = (matrizMedia: any) => {
      console.log("[DD4.0 v6] processarMediaAtendimentos chamado. Tipo:", typeof matrizMedia, "É array?", Array.isArray(matrizMedia));

      // Se recebeu um objeto de erro do Apps Script
      if (matrizMedia && !Array.isArray(matrizMedia) && matrizMedia.status === "error") {
        console.error("[DD4.0 v6] Erro do Apps Script:", matrizMedia.message);
        const scriptMedia = document.getElementById("script-media-google");
        if (scriptMedia) scriptMedia.remove();
        return;
      }

      if (!Array.isArray(matrizMedia) || matrizMedia.length < 6) {
        console.error("[DD4.0 v6] matrizMedia invalida. Length:", matrizMedia?.length);
        const scriptMedia = document.getElementById("script-media-google");
        if (scriptMedia) scriptMedia.remove();
        return;
      }

      console.log("[DD4.0 v6] matrizMedia recebida com", matrizMedia.length, "linhas");

      // Helper: lê célula segura
      const cell = (row: any[] | undefined, idx: number): string =>
        String(row?.[idx] ?? '').trim();

      // ─── Localizar seções por header (dinâmico, não hardcoded) ───
      let idxMetricas  = -1;
      let idxAnalistas = -1;
      let idxSemanas   = -1;
      let idxHubs      = -1;

      for (let i = 0; i < matrizMedia.length; i++) {
        const c0 = cell(matrizMedia[i], 0).toUpperCase();
        if (c0.includes('MÉTRICAS GERAIS') || c0.includes('METRICAS GERAIS'))  idxMetricas  = i;
        else if (c0 === 'RANKING POR ANALISTA')                                idxAnalistas = i;
        else if (c0.includes('DETALHAMENTO POR SEMANA'))                        idxSemanas   = i;
        else if (c0 === 'RANKING POR HUB')                                      idxHubs      = i;
      }

      console.log("[DD4.0 v6] Seções encontradas → Métricas:", idxMetricas, "Analistas:", idxAnalistas, "Semanas:", idxSemanas, "Hubs:", idxHubs);

      // ═══════════════════════════════════════════════════════════
      // 1. MÉTRICAS GERAIS
      //    Layout: [TÍTULO] → [HEADER] → [DATA]
      //    Cols A-H: TotalAtend | TotalSem | TotalDias | Analistas |
      //              MédAtend/Dia | Méd/Dia/Anal | Méd/Hora/Anal | TempoEfetivo
      // ═══════════════════════════════════════════════════════════
      if (idxMetricas >= 0) {
        const valoresGerais = matrizMedia[idxMetricas + 2] || [];
        console.log("[DD4.0 v6] Métricas gerais (row", idxMetricas + 2, "):", valoresGerais);

        const mediaDiaAnalistaVal = Number(String(valoresGerais[5] || '0').replace(',', '.')) || 0;
        setMediaAtendimentoAnalista(mediaDiaAnalistaVal);

        setAtendGerais({
          totalAtendimentos: cell(valoresGerais, 0) || '0',
          totalSemanas:      cell(valoresGerais, 1) || '0',
          totalDiasUteis:    cell(valoresGerais, 2) || '0',
          totalAnalistas:    cell(valoresGerais, 3) || '0',
          mediaAtendDia:     cell(valoresGerais, 4) || '0',
          mediaDiaAnalista:  cell(valoresGerais, 5) || '0',
          mediaHoraAnalista: cell(valoresGerais, 6) || '0',
          tempoEfetivoDia:   cell(valoresGerais, 7) || '0',
        });
      }

      // ═══════════════════════════════════════════════════════════
      // 2. RANKING POR ANALISTA
      //    Header: # | ANALISTA | TOTAL ATEND. | ATEND. dia(PULAR) | ATEND/DIA | %TOTAL | STATUS | TEMPO
      //    Index:  0     1          2              3(SKIP)            4          5        6        7
      // ═══════════════════════════════════════════════════════════
      const analistasTemp: any[] = [];
      if (idxAnalistas >= 0) {
        // Encontra o header procurando "ANALISTA" na coluna B
        let headerIdx = -1;
        for (let i = idxAnalistas + 1; i < Math.min(idxAnalistas + 6, matrizMedia.length); i++) {
          if (cell(matrizMedia[i], 1).toUpperCase().includes('ANALISTA')) {
            headerIdx = i;
            break;
          }
        }
        if (headerIdx >= 0) {
          for (let i = headerIdx + 1; i < matrizMedia.length; i++) {
            const row = matrizMedia[i];
            if (!row || row.length === 0) break;
            const nome = cell(row, 1);
            if (!nome) break;
            analistasTemp.push({
              posicao:     cell(row, 0),
              nome,
              totalAtend:  cell(row, 2),
              // ⚠️ PULA index 3 → coluna "ATEND. dia" (coluna nova)
              atendDia:    cell(row, 4),
              pctTotal:    cell(row, 5),
              status:      cell(row, 6),
              tempoEfetivo: cell(row, 7),
            });
          }
        }
      }
      console.log("[DD4.0 v6] Analistas encontrados:", analistasTemp.length, analistasTemp.map(a => a.nome));
      if (analistasTemp.length > 0) setRankingAnalistasSheet(analistasTemp);

      // ═══════════════════════════════════════════════════════════
      // 3. DETALHAMENTO POR SEMANA
      //    Header: SEMANA | Nº ATEND. | % TOTAL | DESTAQUE(PULAR) | GAP vs MÉDIA | STATUS | ANÁLISE
      //    Index:    0        1           2         3(SKIP)            4             5        6
      // ═══════════════════════════════════════════════════════════
      const semanasTemp: any[] = [];
      if (idxSemanas >= 0) {
        let headerIdx = -1;
        for (let i = idxSemanas + 1; i < Math.min(idxSemanas + 6, matrizMedia.length); i++) {
          if (cell(matrizMedia[i], 0).toUpperCase().includes('SEMANA')) {
            headerIdx = i;
            break;
          }
        }
        if (headerIdx >= 0) {
          for (let i = headerIdx + 1; i < matrizMedia.length; i++) {
            const row = matrizMedia[i];
            if (!row || row.length === 0) break;
            const semana = cell(row, 0);
            if (!semana || !semana.toLowerCase().startsWith('week')) break;
            semanasTemp.push({
              semana,
              numAtend:  cell(row, 1),
              pctTotal:  cell(row, 2),
              // ⚠️ PULA index 3 → coluna "DESTAQUE"
              gap:       cell(row, 4),
              status:    cell(row, 5),
              analise:   cell(row, 6),
            });
          }
        }
      }
      console.log("[DD4.0 v6] Semanas encontradas:", semanasTemp.length);
      if (semanasTemp.length > 0) setDetalheSemanas(semanasTemp);

      // ═══════════════════════════════════════════════════════════
      // 4. RANKING POR HUB
      //    Header: # | HUB | TOTAL ATEND. | atend_dia(PULAR) | % TOTAL | STATUS | ANÁLISE
      //    Index:  0    1       2             3(SKIP)            4        5        6
      // ═══════════════════════════════════════════════════════════
      const hubsTemp: any[] = [];
      if (idxHubs >= 0) {
        let headerIdx = -1;
        for (let i = idxHubs + 1; i < Math.min(idxHubs + 6, matrizMedia.length); i++) {
          if (cell(matrizMedia[i], 1).toUpperCase().includes('HUB')) {
            headerIdx = i;
            break;
          }
        }
        if (headerIdx >= 0) {
          for (let i = headerIdx + 1; i < matrizMedia.length; i++) {
            const row = matrizMedia[i];
            if (!row || row.length === 0) break;
            const hub = cell(row, 1);
            if (!hub) break;
            hubsTemp.push({
              posicao:    cell(row, 0),
              hub,
              totalAtend: cell(row, 2),
              // ⚠️ PULA index 3 → coluna "0" / atend do dia
              pctTotal:   cell(row, 4),
              status:     cell(row, 5),
              analise:    cell(row, 6),
            });
          }
        }
      }
      console.log("[DD4.0 v6] HUBs encontrados:", hubsTemp.length);
      if (hubsTemp.length > 0) setRankingHubsSheet(hubsTemp);

      const scriptMedia = document.getElementById("script-media-google");
      if (scriptMedia) scriptMedia.remove();
    };

    dispararSincronizacao();

    return () => {
      delete (window as any).processarDadosPlanilha;
      delete (window as any).confirmarGravacaoTratamento;
      delete (window as any).processarMediaAtendimentos;
    };
  }, []);

  const dispararSincronizacao = () => {
    setStatus("🔄 Carregando dados da nuvem Shopee...");
    const scriptVelho = document.getElementById("script-conexao-google");
    if (scriptVelho) scriptVelho.remove();

    const appsScriptUrl = "https://script.google.com/a/macros/shopee.com/s/AKfycbzzeABmBcN78oJI9sWOsMqEG2Nr5RL2Roj9rmJQhPV7t2Q5RNr5OEd1ec2VniQXthmI/exec";
    const urlFinal = `${appsScriptUrl}?action=listarMotoristas&callback=processarDadosPlanilha&_=${new Date().getTime()}`;

    const script = document.createElement("script");
    script.id = "script-conexao-google";
    script.src = urlFinal;
    script.async = true;
    script.onerror = () => {
      console.error("[DD4.0 v6] Erro ao carregar script listarMotoristas");
      setStatus("❌ Erro na conexao com o servidor. Recarregue a pagina.");
    };
    document.body.appendChild(script);

    // Segunda chamada JSONP para buscar dados completos da aba "Atendimentos DD.40"
    // ⚠️ O Apps Script DEVE retornar range A:H (8 colunas), NÃO A:G
    const scriptMediaVelho = document.getElementById("script-media-google");
    if (scriptMediaVelho) scriptMediaVelho.remove();
    const urlMedia = `${appsScriptUrl}?action=buscarMediaAtendimentos&callback=processarMediaAtendimentos&_=${new Date().getTime() + 1}`;
    const scriptMedia = document.createElement("script");
    scriptMedia.id = "script-media-google";
    scriptMedia.src = urlMedia;
    scriptMedia.async = true;
    scriptMedia.onerror = () => {
      console.error("[DD4.0 v6] Erro ao carregar script buscarMediaAtendimentos. Verifique se o Apps Script foi atualizado.");
    };
    document.body.appendChild(scriptMedia);

    // Timeout de seguranca: se depois de 15s os dados nao chegaram, avisar
    setTimeout(() => {
      if (mediaAtendimentoAnalista === 0 && !atendGerais) {
        console.warn("[DD4.0 v6] TIMEOUT: Dados da aba Atendimentos DD.40 nao foram recebidos em 15s. O Apps Script pode nao ter sido atualizado/reimplantado.");
      }
    }, 15000);
  };

  const enviarTratamentoPlanilha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motoristaSelecionado) return;

    setSalvandoTratamento(true);
    const appsScriptUrl = "https://script.google.com/a/macros/shopee.com/s/AKfycbxvAn4kvKNlkCH5klqipLNJ7Q8pEEvGyHxo5R0fDWFm3Jh1pSJyZzM8d-L94-N5cASR/exec";

    const parametros = new URLSearchParams({
      action: "salvarTratamento",
      callback: "confirmarGravacaoTratamento",
      dealDate: motoristaSelecionado.dealDate,
      weekend: motoristaSelecionado.weekend,
      hub: motoristaSelecionado.hub,
      analyst: motoristaSelecionado.analyst,
      driverName: motoristaSelecionado.driverName,
      status: motoristaSelecionado.presenca,
      dataTreinamentoInput: motoristaSelecionado.dataTreinamentoInput,
      modal: motoristaSelecionado.modal,
      driverId: motoristaSelecionado.driverId,
      telefone: motoristaSelecionado.telefone,
      colunaK: respostaK,
      colunaL: respostaL,
      colunaM: respostaM,
      colunaN: respostaN,
      colunaO: respostaO,
      _ : new Date().getTime().toString()
    });
    const urlFinal = `${appsScriptUrl}?${parametros.toString()}`;

    const scriptVelho = document.getElementById("script-envio-google");
    if (scriptVelho) scriptVelho.remove();

    const script = document.createElement("script");
    script.id = "script-envio-google";
    script.src = urlFinal;
    script.async = true;
    document.body.appendChild(script);
  };

  const fecharModalLimpar = () => {
    setMotoristaSelecionado(null);
    setTermoBusca("");
    setRespostaK("");
    setRespostaL("");
    setRespostaM("");
    setRespostaN("");
    setRespostaO("");
  };

  // Busca Inteligente
  const resultadosBusca = termoBusca.trim().length >= 2
    ? baseMotoristas.filter(m =>
        m.driverName.toLowerCase().includes(termoBusca.toLowerCase()) ||
        m.driverId.toLowerCase().includes(termoBusca.toLowerCase()) ||
        m.telefone.toLowerCase().includes(termoBusca.toLowerCase())
      ).slice(0, 5)
    : [];

  // =================================================================
  // MOTOR DE FILTRAGEM CORRIGIDO (COMPATÍVEL COM MULTI-SELECT)
  // =================================================================
  const hubsSelecionados = (filtroHub && filtroHub !== "TODOS")
    ? filtroHub.split(',').map(x => x.trim().toLowerCase())
    : [];

  const modaisSelecionados = (filtroModal && filtroModal !== "TODOS")
    ? filtroModal.split(',').map(x => x.trim().toLowerCase())
    : [];

  const semanasSelecionadas = (filtroSemana && filtroSemana !== "TODOS")
    ? filtroSemana.split(',').map(x => x.trim().toLowerCase())
    : [];

  const analistasSelecionados = (filtroAnalista && filtroAnalista !== "TODOS")
    ? filtroAnalista.split(',').map(x => x.trim().toLowerCase())
    : [];

  const listaFiltradaDash = baseMotoristas.filter((m) => {
    if (!m) return false;
    const valorHub = String(m.hub || '').trim().toLowerCase();
    const bateHub = hubsSelecionados.length === 0 || hubsSelecionados.includes(valorHub);
    const valorModal = String(m.modal || '').trim().toLowerCase();
    const bateModal = modaisSelecionados.length === 0 || modaisSelecionados.includes(valorModal);
    const valorSemana = String(m.weekend || '').trim().toLowerCase();
    const bateSemana = semanasSelecionadas.length === 0 || semanasSelecionadas.includes(valorSemana);
    const valorAnalista = String(m.analyst || '').trim().toLowerCase();
    const bateAnalista = analistasSelecionados.length === 0 || analistasSelecionados.includes(valorAnalista);
    return bateHub && bateModal && bateSemana && bateAnalista;
  });

  const contagemModais: { [key: string]: number } = {};
  listaFiltradaDash.forEach(m => {
    if (m.modal) contagemModais[m.modal] = (contagemModais[m.modal] || 0) + 1;
  });

  const modaisPagina2 = Object.keys(contagemModais).map(nome => {
    const qtd = contagemModais[nome];
    const pct = listaFiltradaDash.length > 0 ? (qtd / listaFiltradaDash.length) * 100 : 0;
    return { name: nome, qtd, pct };
  }).sort((a, b) => b.qtd - a.qtd);

  const classesTema = {
    card: "bg-zinc-900/40 border-zinc-800/50 text-white backdrop-blur-md",
    input: "bg-zinc-950 border-zinc-800 text-zinc-200 focus:border-orange-500 transition-colors",
    textTitle: "text-white"
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-3 md:p-5 lg:p-6 font-sans selection:bg-orange-500/30 relative">
      {/* CONTAINER LANDSCAPE: max-w-[1920px] em vez de max-w-7xl */}
      <div className="max-w-[1920px] w-full mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row items-center gap-6 pb-4 border-b border-zinc-800/600 w-full">
          <div className="w-full lg:w-1/4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-22 rounded-full bg-[#EE4D2D]/10 dark:bg-[#EE4D2D]/20 border border-[#EE4D2D]/30 flex items-center justify-center text-2xl shadow-md select-none transition-transform hover:scale-105">
          🦊
</div>
            <div>
            <h1 className="text-4xl font-black tracking-tight text-[#FF6E51] leading-tight">
  Drivers Day 4.0
</h1>
              <p className="text-[11px] text-zinc-400 font-medium leading-none mt-1">
                Sistema de Gestão Integrada e Integração Operacional
              </p>
              <p className="text-[9px] text-zinc-500 font-mono mt-0.5 truncate max-w-[220px]" title={status}>
                {status}
              </p>
            </div>
          </div>

          <div className="w-full lg:w-3/4">
            {baseMotoristas.length > 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800/60 p-4 rounded-2xl relative w-full">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-orange-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-orange-500 rounded-full animate-pulse" />
                    buscador de leads
                    <span className="text-blue-600 font-normal lowercase tracking-normal pl-0.5 hidden sm:inline">
                      (digite o nome, ID ou telefone para abrir a ficha suspensa de perguntas)
                    </span>
                  </label>

                  <input
                    type="text"
                    placeholder="Digite para pesquisar (Ex: Nome, ID do Driver ou Número de Telefone)..."
                    value={termoBusca}
                    onChange={(e) => setTermoBusca(e.target.value)}
                    className="w-full mt-1.5 p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs outline-none focus:border-orange-500 transition-colors font-semibold text-zinc-200 placeholder-zinc-600"
                  />
                </div>

                {resultadosBusca.length > 0 && (
                  <div className="absolute left-0 right-0 z-50 mt-2 bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl divide-y divide-zinc-900 mx-1">
                    {resultadosBusca.map((m, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setMotoristaSelecionado(m);
                          setTermoBusca("");
                        }}
                        className="w-full p-3 text-left hover:bg-zinc-900/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                      >
                        <span className="font-bold text-zinc-100 text-sm">{m.driverName}</span>
                        <div className="flex gap-4 text-zinc-400 font-mono">
                          <span>🆔 ID: {m.driverId}</span>
                          <span>📞 Tel: {m.telefone}</span>
                          <span className="text-orange-400 font-bold">{m.hub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 text-center bg-zinc-900/10 border border-zinc-800/30 rounded-xl text-zinc-500 text-xs italic">
                Aguardando conexão com o banco de dados...
              </div>
            )}
          </div>

        </div>

        {/* Dashboard */}
        {baseMotoristas.length > 0 ? (
         <Dashboard
         listaFiltradaDash={listaFiltradaDash}
         modaisPagina2={modaisPagina2}
         classesTema={classesTema}
         disparosRealizados={valorK2}
         disparosData={disparosData}
         mediaAtendimentoAnalista={mediaAtendimentoAnalista}
         atendGerais={atendGerais}
         rankingAnalistasSheet={rankingAnalistasSheet}
         detalheSemanas={detalheSemanas}
         rankingHubsSheet={rankingHubsSheet}
         filtroHub={filtroHub}
         setFiltroHub={setFiltroHub}
         filtroModal={filtroModal}
         setFiltroModal={setFiltroModal}
         filtroSemana={filtroSemana}
         setFiltroSemana={setFiltroSemana}
         filtroAnalista={filtroAnalista}
         setFiltroAnalista={setFiltroAnalista}
         opcoesHubs={opcoesHubs}
         opcoesModais={opcoesModais}
         opcoesSemanas={opcoesSemanas}
         opcoesAnalistas={opcoesAnalistas}
       />
        ) : (
          <div className="p-12 text-center bg-zinc-900/20 border border-zinc-800/40 rounded-2xl">
            <p className="text-sm text-zinc-400">Nenhum registro carregado na memória local.</p>
            <p className="text-xs text-zinc-600 mt-1">Carregando dados automaticamente a partir do ecossistema Google Workspace...</p>
          </div>
        )}

        {/* Modal de Tratamento */}
        {motoristaSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={fecharModalLimpar}
            />

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-4xl w-full shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto space-y-6">

              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-wider text-orange-400">📝 Tratar Ficha Operacional</h2>
                  <p className="text-xs text-zinc-400">Insira as respostas que serão gravadas na Página2</p>
                </div>
                <button
                  type="button"
                  onClick={fecharModalLimpar}
                  className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors text-xs font-bold px-3"
                >
                  ✕ Fechar
                </button>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><span className="text-zinc-500 block">Motorista:</span> <strong className="text-white text-sm">{motoristaSelecionado.driverName}</strong></div>
                <div><span className="text-zinc-500 block">ID Driver:</span> <strong className="text-zinc-300 font-mono">{motoristaSelecionado.driverId}</strong></div>
                <div><span className="text-zinc-500 block">Telefone:</span> <strong className="text-zinc-300 font-mono">{motoristaSelecionado.telefone}</strong></div>
                <div><span className="text-zinc-500 block">HUB de Destino:</span> <strong className="text-orange-400 font-bold">{motoristaSelecionado.hub}</strong></div>
              </div>

              <form onSubmit={enviarTratamentoPlanilha} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wide">
                      1. O contato foi estabelecido com o motorista após algum dos três contatos?
                    </label>
                    <select required value={respostaK} onChange={(e) => setRespostaK(e.target.value)} className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold outline-none text-white focus:border-orange-500">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wide">
                      2. O motorista sinalizou disponibilidade para o seu primeiro dia?
                    </label>
                    <select required value={respostaL} onChange={(e) => setRespostaL(e.target.value)} className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold outline-none text-white focus:border-orange-500">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wide">
                      3. Qual dia o motorista sinalizou disponibilidade? (dd/mm/aa)
                    </label>
                    <input
                      type="date"
                      required
                      value={respostaM}
                      onChange={(e) => setRespostaM(e.target.value)}
                      className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold outline-none text-white focus:border-orange-500 color-scheme-dark"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wide">
                      4. Motorista compareceu no HUB e estava apto no dia marcado?
                    </label>
                    <select required value={respostaO} onChange={(e) => setRespostaO(e.target.value)} className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold outline-none text-white focus:border-orange-500">
                      <option value="">Selecione...</option>
                      <option value="Sim">Sim</option>
                      <option value="Não">Não</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold text-zinc-300 uppercase tracking-wide">
                    📝 Observação contatos
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Digite observações sobre as tentativas de contato..."
                    value={respostaN}
                    onChange={(e) => setRespostaN(e.target.value)}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-medium outline-none text-zinc-200 focus:border-orange-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 border-t border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={fecharModalLimpar}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoTratamento}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 transition-all flex items-center gap-2"
                  >
                    {salvandoTratamento ? "🔄 Salvando na Planilha..." : "💾 Salvar Tratamento Operacional"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>

      {/* ASSISTENTE IA GERENCIAL */}
      {baseMotoristas.length > 0 && (
        <AiChat
          dadosOperacao={{
            resumo: {
              mediaAtendimentos: atendGerais?.mediaDiaAnalista || "9,9",
              totalAtendimentos: atendGerais?.totalAtendimentos || "0",
              sla: atendGerais?.tempoEfetivoDia || "—",
              totalAnalistas: atendGerais?.totalAnalistas || "0",
              totalSemanas: atendGerais?.totalSemanas || "0",
              totalHubs: String(rankingHubsSheet.length),
              mediaAtendDia: atendGerais?.mediaAtendDia || "0",
              mediaHoraAnalista: atendGerais?.mediaHoraAnalista || "0",
              totalDiasUteis: atendGerais?.totalDiasUteis || "0",
            },
            analistas: rankingAnalistasSheet,
            hubs: rankingHubsSheet,
            semanas: detalheSemanas,
            disparos: disparosData,
            motoristas: baseMotoristas,
          }}
        />
      )}

    </div>
  );
}
