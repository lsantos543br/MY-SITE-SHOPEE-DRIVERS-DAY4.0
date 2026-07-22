"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

type ShopeeApiPayload = Record<string, string | number | boolean | null | undefined>;

export type ShopeeMotorista = {
  dealDate: string;
  weekend: string;
  semana?: string;
  Weekend: string;
  Semana?: string;
  hub: string;
  filial?: string;
  Filial?: string;
  analyst: string;
  analista?: string;
  Analyst: string;
  Analista?: string;
  driverName: string;
  status: string;
  Status: string;
  presenca: string;
  treinado: string;
  fezFirstTrip: string;
  dataTreinamentoInput: string;
  modal: string;
  Modal: string;
  veiculo?: string;
  driverId: string;
  telefone: string;
  Hub: string;
};

export type ShopeeAtendGerais = {
  totalAtendimentos: string;
  totalSemanas: string;
  totalDiasUteis: string;
  totalAnalistas: string;
  mediaAtendDia: string;
  mediaDiaAnalista: string;
  mediaHoraAnalista: string;
  tempoEfetivoDia: string;
};

export type AnalistaRankingRow = {
  posicao: string;
  nome: string;
  totalAtend: string;
  atendDia: string;
  pctTotal: string;
  status: string;
  tempoEfetivo: string;
};

export type DetalheSemanaRow = {
  semana: string;
  numAtend: string;
  pctTotal: string;
  gap: string;
  status: string;
  analise: string;
};

export type RankingHubRow = {
  posicao: string;
  hub: string;
  totalAtend: string;
  pctTotal: string;
  status: string;
  analise: string;
};

export type DisparoData = { semana: string };

const fetchShopeeApi = async (action: string, payload: ShopeeApiPayload = {}) => {
  const response = await fetch("/api/shopee-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });

  const text = await response.text();

  // Try to parse JSON safely; if parsing fails, include text snippet in error
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    const snippet = String(text || '').slice(0, 400);
    if (!response.ok) {
      throw new Error(`Erro ${response.status} ao chamar /api/shopee-data: ${snippet}`);
    }
    throw new Error(`Resposta inválida da API Shopee (não JSON): ${snippet}`);
  }

  if (!response.ok) {
    const base = json?.error || `Erro ${response.status} ao chamar /api/shopee-data`;
    const details = typeof json?.details === "string" && json.details.trim() ? ` — ${String(json.details).slice(0,400)}` : "";
    throw new Error(`${base}${details}`);
  }

  if (!json || typeof json !== "object" || !("data" in json)) {
    throw new Error("Resposta inválida da API Shopee.");
  }

  return json.data;
};

const fetchAppsScriptData = async (action: string, payload: ShopeeApiPayload = {}) => {
  return fetchShopeeApi(action, payload);
};

const normalizeString = (value: unknown): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();

const findHeaderIndex = (headers: string[], candidates: string[]) =>
  candidates
    .map((candidate) => headers.indexOf(candidate.toLowerCase()))
    .find((index) => index !== -1) ?? -1;

const processarDadosPlanilha = (
  matrizCrua: unknown,
  setBaseMotoristas: Dispatch<SetStateAction<ShopeeMotorista[]>>,
  setDisparosData: Dispatch<SetStateAction<{ semana: string }[]>>,
  setValorK2: Dispatch<SetStateAction<number>>,
  setDisparosRealizados: Dispatch<SetStateAction<number>>,
  setOpcoesHubs: Dispatch<SetStateAction<string[]>>,
  setOpcoesModais: Dispatch<SetStateAction<string[]>>,
  setOpcoesSemanas: Dispatch<SetStateAction<string[]>>,
  setOpcoesAnalistas: Dispatch<SetStateAction<string[]>>,
  setStatus: Dispatch<SetStateAction<string>>
) => {
  if (!Array.isArray(matrizCrua) || matrizCrua.length <= 1) {
    console.warn("Dados de motoristas em formato inválido:", matrizCrua);
    setStatus("⚠️ Dados de motoristas incompletos. Usando valores padrão.");
    return;
  }

  const cabecalho = matrizCrua[0].map((c: unknown) => normalizeString(c).toLowerCase());
  const idxDealDate = findHeaderIndex(cabecalho, ["deal date", "data", "data de deal"]);
  const idxWeekend = findHeaderIndex(cabecalho, ["weekend", "semana", "semana entrada", "semana de entrega"]);
  const idxHub = findHeaderIndex(cabecalho, ["hub", "filial"]);
  const idxAnalyst = findHeaderIndex(cabecalho, ["analyst", "analista"]);
  const idxDriver = findHeaderIndex(cabecalho, ["driver", "driver name", "drivername", "nome", "name"]);
  const idxStatus = findHeaderIndex(cabecalho, ["status", "presenca", "presenca", "assistencia"]);
  const idxModal = findHeaderIndex(cabecalho, ["modal", "veiculo"]);
  const idxDriverId = findHeaderIndex(cabecalho, ["driver id", "id", "id do motorista"]);
  const idxTelefone = findHeaderIndex(cabecalho, ["telefone", "phone", "celular"]);
  const idxDataTreinamento = findHeaderIndex(cabecalho, ["data treinamento", "data de treinamento", "treinamento"]);
  const idxSemanaEntrada = findHeaderIndex(cabecalho, ["semana entrada", "semana"]);
  const idxNome = findHeaderIndex(cabecalho, ["nome", "name"]);

  const motoristasFormatados = matrizCrua.slice(1)
    .map((linha: unknown[]) => {
      const statusOriginal = idxStatus !== -1 ? normalizeString(linha[idxStatus]) : "";
      const possuiTreinamento =
        idxDataTreinamento !== -1 && normalizeString(linha[idxDataTreinamento]) !== ""
          ? "Sim"
          : "Não";
      const nomeMotorista = idxDriver !== -1
        ? normalizeString(linha[idxDriver])
        : idxNome !== -1
          ? normalizeString(linha[idxNome])
          : "";

      return {
        dealDate: idxDealDate !== -1 ? normalizeString(linha[idxDealDate]) : "",
        weekend: idxWeekend !== -1
          ? normalizeString(linha[idxWeekend])
          : idxSemanaEntrada !== -1
            ? normalizeString(linha[idxSemanaEntrada])
            : "",
        hub: idxHub !== -1 ? normalizeString(linha[idxHub]) : "",
        analyst: idxAnalyst !== -1 ? normalizeString(linha[idxAnalyst]) : "",
        driverName: nomeMotorista,
        status: statusOriginal,
        Status: statusOriginal,
        presenca: statusOriginal,
        treinado: possuiTreinamento,
        fezFirstTrip: statusOriginal,
        dataTreinamentoInput: idxDataTreinamento !== -1 ? normalizeString(linha[idxDataTreinamento]) : "",
        modal: idxModal !== -1 ? normalizeString(linha[idxModal]) : "",
        driverId: idxDriverId !== -1 ? normalizeString(linha[idxDriverId]) : "",
        telefone: idxTelefone !== -1 ? normalizeString(linha[idxTelefone]) : "",
        Hub: idxHub !== -1 ? normalizeString(linha[idxHub]) : "",
        Modal: idxModal !== -1 ? normalizeString(linha[idxModal]) : "",
        Weekend: idxWeekend !== -1
          ? normalizeString(linha[idxWeekend])
          : idxSemanaEntrada !== -1
            ? normalizeString(linha[idxSemanaEntrada])
            : "",
        Analyst: idxAnalyst !== -1 ? normalizeString(linha[idxAnalyst]) : "",
      } as ShopeeMotorista;
    })
    .filter((m: ShopeeMotorista) => m.driverName !== "" && (m.driverId !== "" || m.telefone !== "" || m.hub !== ""));

  const totalDisparos = motoristasFormatados.length;
  setDisparosData(motoristasFormatados.map((m) => ({ semana: m.weekend || "" })));
  setValorK2(totalDisparos);
  setDisparosRealizados(totalDisparos);

  setBaseMotoristas(motoristasFormatados);

  const hubsUnicos = Array.from(new Set(motoristasFormatados.map((m) => m.hub).filter(Boolean))).sort();
  const modaisUnicos = Array.from(new Set(motoristasFormatados.map((m) => m.modal).filter(Boolean))).sort();
  const semanasUnicas = Array.from(new Set(motoristasFormatados.map((m) => m.weekend).filter(Boolean))).sort();
  const analistasUnicos = Array.from(new Set(motoristasFormatados.map((m) => m.analyst).filter(Boolean))).sort();

  setOpcoesHubs(["TODOS", ...hubsUnicos]);
  setOpcoesModais(["TODOS", ...modaisUnicos]);
  setOpcoesSemanas(["TODOS", ...semanasUnicas]);
  setOpcoesAnalistas(["TODOS", ...analistasUnicos]);

  setStatus(`✅ Sincronizado com sucesso! ${motoristasFormatados.length} registros ativos.`);
};

const isTimeValue = (value: string) => /^(?:\d{1,2}[:h]|.*min)/i.test(value.trim());
const isNumericValue = (value: string) => {
  const cleaned = String(value).replace(/[^0-9,.-]/g, "").replace(/,/g, ".").trim();
  return cleaned !== "" && !Number.isNaN(Number(cleaned));
};

const isPossivelLinhaDeResumo = (linha: unknown) => {
  if (!Array.isArray(linha) || linha.length === 0) return false;
  const primeiraColuna = normalizeString(linha[0]);
  if (!primeiraColuna) return false;
  if (/^(ranking por analista|detalhamento por semana|ranking por hub|posição|posicao|semana|posição)$/i.test(primeiraColuna)) {
    return false;
  }
  if (/^\d+$/.test(primeiraColuna)) {
    return false;
  }

  const valoresNumericos = linha.slice(1, 8).filter((cell) => {
    const normalized = normalizeString(cell);
    return normalized !== "" && (isNumericValue(normalized) || isTimeValue(normalized));
  });

  return valoresNumericos.length >= 4;
};

const findResumoLinha = (matrizMedia: unknown[]) => {
  if (!Array.isArray(matrizMedia)) return null;
  return matrizMedia.find(isPossivelLinhaDeResumo) as unknown[] | null;
};

const processarMediaAtendimentos = (
  matrizMedia: unknown,
  setMediaAtendimentoAnalista: Dispatch<SetStateAction<number>>,
  setAtendGerais: Dispatch<SetStateAction<ShopeeAtendGerais>>,
  setRankingAnalistasSheet: Dispatch<SetStateAction<AnalistaRankingRow[]>>,
  setDetalheSemanas: Dispatch<SetStateAction<DetalheSemanaRow[]>>,
  setRankingHubsSheet: Dispatch<SetStateAction<RankingHubRow[]>>,
  setStatus: Dispatch<SetStateAction<string>>
) => {
  if (matrizMedia && typeof matrizMedia === "object" && (matrizMedia.status === "error" || matrizMedia.error)) {
    console.warn("Apps Script retornou erro de métricas:", matrizMedia);
    setStatus(`⚠️ ${matrizMedia.message || matrizMedia.error || "Erro ao carregar métricas."}`);
    return;
  }

  if (!Array.isArray(matrizMedia)) {
    console.warn("Dados de métricas não são um array:", matrizMedia);
    setStatus("⚠️ Dados de métricas em formato inesperado. Usando valores padrão.");
    return;
  }

  const resumoLinha = findResumoLinha(matrizMedia);
  const fallbackLinha = Array.isArray(matrizMedia[5]) ? matrizMedia[5] : [];
  const valoresGerais = resumoLinha || fallbackLinha;

  if (!resumoLinha) {
    const fallbackValido = isPossivelLinhaDeResumo(fallbackLinha);
    if (!fallbackValido) {
      console.warn("Não foi possível extrair a linha de resumo de métricas. Matriz recebida:", matrizMedia);
      setStatus("⚠️ Métricas não localizadas na planilha. Usando valores anteriores.");
      return;
    }
  }

  const mediaDiaAnalistaVal = Number(String(valoresGerais[5] || "0").replace(",", ".")) || 0;
  setMediaAtendimentoAnalista(mediaDiaAnalistaVal);

  setAtendGerais({
    totalAtendimentos: String(valoresGerais[0] || "0"),
    totalSemanas: String(valoresGerais[1] || "0"),
    totalDiasUteis: String(valoresGerais[2] || "0"),
    totalAnalistas: String(valoresGerais[3] || "0"),
    mediaAtendDia: String(valoresGerais[4] || "0"),
    mediaDiaAnalista: String(valoresGerais[5] || "0"),
    mediaHoraAnalista: String(valoresGerais[6] || "0"),
    tempoEfetivoDia: String(valoresGerais[7] || "0"),
  });

  const analistasTemp: AnalistaRankingRow[] = [];
  let emSecaoAnalista = false;
  let pularLinhasAnalista = 0;

  for (let i = 0; i < matrizMedia.length; i++) {
    const primeiraCol = normalizeString(matrizMedia[i]?.[0]);
    if (primeiraCol === "RANKING POR ANALISTA") {
      emSecaoAnalista = true;
      pularLinhasAnalista = 2;
      continue;
    }
    if (emSecaoAnalista) {
      if (pularLinhasAnalista > 0) {
        pularLinhasAnalista--;
        continue;
      }
      if (
        !matrizMedia[i] ||
        matrizMedia[i].length === 0 ||
        primeiraCol === "" ||
        primeiraCol === "DETALHAMENTO POR SEMANA" ||
        primeiraCol === "RANKING POR HUB"
      ) {
        emSecaoAnalista = false;
        if (primeiraCol === "DETALHAMENTO POR SEMANA" || primeiraCol === "RANKING POR HUB") i--;
        continue;
      }
      const row = matrizMedia[i];
      analistasTemp.push({
        posicao: normalizeString(row[0]),
        nome: normalizeString(row[1]),
        totalAtend: normalizeString(row[2]),
        atendDia: normalizeString(row[4]),
        pctTotal: normalizeString(row[5]),
        status: normalizeString(row[6]),
        tempoEfetivo: normalizeString(row[7]),
      });
    }
  }

  setRankingAnalistasSheet(analistasTemp);

  const semanasTemp: DetalheSemanaRow[] = [];
  let emSecaoSemana = false;
  let pularLinhasSemana = 0;

  for (let i = 0; i < matrizMedia.length; i++) {
    const primeiraCol = normalizeString(matrizMedia[i]?.[0]);
    if (primeiraCol === "DETALHAMENTO POR SEMANA") {
      emSecaoSemana = true;
      pularLinhasSemana = 2;
      continue;
    }
    if (emSecaoSemana) {
      if (pularLinhasSemana > 0) {
        pularLinhasSemana--;
        continue;
      }
      if (
        !matrizMedia[i] ||
        matrizMedia[i].length === 0 ||
        primeiraCol === "" ||
        primeiraCol === "RANKING POR HUB" ||
        primeiraCol === "RANKING POR ANALISTA"
      ) {
        emSecaoSemana = false;
        continue;
      }
      const row = matrizMedia[i];
      semanasTemp.push({
        semana: normalizeString(row[0]),
        numAtend: normalizeString(row[1]),
        pctTotal: normalizeString(row[2]),
        gap: normalizeString(row[4]),
        status: normalizeString(row[5]),
        analise: normalizeString(row[6]),
      });
    }
  }

  setDetalheSemanas(semanasTemp);

  const hubsTemp: RankingHubRow[] = [];
  let emSecaoHub = false;
  let pularLinhasHub = 0;

  for (let i = 0; i < matrizMedia.length; i++) {
    const primeiraCol = normalizeString(matrizMedia[i]?.[0]);
    if (primeiraCol === "RANKING POR HUB") {
      emSecaoHub = true;
      pularLinhasHub = 2;
      continue;
    }
    if (emSecaoHub) {
      if (pularLinhasHub > 0) {
        pularLinhasHub--;
        continue;
      }
      if (!matrizMedia[i] || matrizMedia[i].length === 0 || primeiraCol === "") {
        emSecaoHub = false;
        continue;
      }
      const row = matrizMedia[i];
      hubsTemp.push({
        posicao: normalizeString(row[0]),
        hub: normalizeString(row[1]),
        totalAtend: normalizeString(row[2]),
        pctTotal: normalizeString(row[4]),
        status: normalizeString(row[5]),
        analise: normalizeString(row[6]),
      });
    }
  }

  setRankingHubsSheet(hubsTemp);
};

export function useShopeeData() {
  const [baseMotoristas, setBaseMotoristas] = useState<ShopeeMotorista[]>([]);
  const [status, setStatus] = useState("Aguardando sincronização...");
  const [valorK2, setValorK2] = useState(0);
  const [disparosRealizados, setDisparosRealizados] = useState(0);
  const [disparosData, setDisparosData] = useState<{ semana: string }[]>([]);
  const [mediaAtendimentoAnalista, setMediaAtendimentoAnalista] = useState(9.8);
  const [atendGerais, setAtendGerais] = useState<ShopeeAtendGerais>({
    totalAtendimentos: "5.023",
    totalSemanas: "15",
    totalDiasUteis: "73",
    totalAnalistas: "7",
    mediaAtendDia: "68,8",
    mediaDiaAnalista: "9,8",
    mediaHoraAnalista: "00:55",
    tempoEfetivoDia: "04h55min de 9h (54,6%)",
  });
  const [rankingAnalistasSheet, setRankingAnalistasSheet] = useState<AnalistaRankingRow[]>([]);
  const [detalheSemanas, setDetalheSemanas] = useState<DetalheSemanaRow[]>([]);
  const [rankingHubsSheet, setRankingHubsSheet] = useState<RankingHubRow[]>([]);
  const [opcoesHubs, setOpcoesHubs] = useState<string[]>(["TODOS"]);
  const [opcoesModais, setOpcoesModais] = useState<string[]>(["TODOS"]);
  const [opcoesSemanas, setOpcoesSemanas] = useState<string[]>(["TODOS"]);
  const [opcoesAnalistas, setOpcoesAnalistas] = useState<string[]>(["TODOS"]);

  useEffect(() => {
    const carregarDados = async () => {
      setStatus("🔄 Carregando dados da nuvem Shopee...");
      let matrizCrua: unknown = null;

      const getErrorMessage = (error: unknown) =>
        error instanceof Error ? error.message : String(error);

      try {
        matrizCrua = await fetchAppsScriptData("listarMotoristas");
        processarDadosPlanilha(
          matrizCrua,
          setBaseMotoristas,
          setDisparosData,
          setValorK2,
          setDisparosRealizados,
          setOpcoesHubs,
          setOpcoesModais,
          setOpcoesSemanas,
          setOpcoesAnalistas,
          setStatus
        );
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.error("[DD4.0] Erro ao carregar motoristas:", error);
        setStatus(`❌ Falha ao carregar motoristas: ${message || "Erro desconhecido"}`);
      }

      try {
        const matrizMedia = await fetchAppsScriptData("buscarMediaAtendimentos");
        processarMediaAtendimentos(
          matrizMedia,
          setMediaAtendimentoAnalista,
          setAtendGerais,
          setRankingAnalistasSheet,
          setDetalheSemanas,
          setRankingHubsSheet,
          setStatus
        );
      } catch (error: unknown) {
        const message = getErrorMessage(error);
        console.warn("[DD4.0] Erro ao carregar métricas:", error);
        setStatus(`⚠️ Métricas indisponíveis: ${message || "Falha ao buscar Página2."}`);
      }

      if (Array.isArray(matrizCrua) && matrizCrua.length > 1) {
        setStatus(`✅ Sincronizado com sucesso! ${matrizCrua.length - 1} registros ativos.`);
      }
    };

    carregarDados();
  }, []);

  return {
    baseMotoristas,
    status,
    valorK2,
    disparosRealizados,
    disparosData,
    mediaAtendimentoAnalista,
    atendGerais,
    rankingAnalistasSheet,
    detalheSemanas,
    rankingHubsSheet,
    opcoesHubs,
    opcoesModais,
    opcoesSemanas,
    opcoesAnalistas,
  };
}
