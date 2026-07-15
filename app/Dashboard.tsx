'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Users, Calendar, CheckCircle, BarChart3, TrendingUp,
  Target, FilterX, ChevronDown, Check,
  Activity, Download, Clock, Award, Zap, Gauge, Building2, UserCheck
} from 'lucide-react';

interface DashboardProps {
  listaFiltradaDash: any[];
  modaisPagina2: { name: string; qtd: number; pct: number }[];
  classesTema: { card: string; input: string; textTitle: string };
  disparosRealizados?: number;
  disparosData?: {semana: string}[];
  mediaAtendimentoAnalista?: number;
  atendGerais?: any;
  rankingAnalistasSheet?: any[];
  detalheSemanas?: any[];
  rankingHubsSheet?: any[];
  filtroHub: string;
  setFiltroHub: (val: string) => void;
  filtroModal: string;
  setFiltroModal: (val: string) => void;
  filtroSemana: string;
  setFiltroSemana: (val: string) => void;
  filtroAnalista: string;
  setFiltroAnalista: (val: string) => void;
  opcoesHubs: string[];
  opcoesModais: string[];
  opcoesSemanas: string[];
  opcoesAnalistas: string[];
}

export default function Dashboard({
  listaFiltradaDash = [],
  modaisPagina2 = [],
  disparosRealizados = 0,
  disparosData = [],
  mediaAtendimentoAnalista = 0,
  atendGerais = null,
  rankingAnalistasSheet = [],
  detalheSemanas = [],
  rankingHubsSheet = [],
  filtroHub = "TODOS",
  setFiltroHub,
  filtroModal = "TODOS",
  setFiltroModal,
  filtroSemana = "TODOS",
  setFiltroSemana,
  filtroAnalista = "TODOS",
  setFiltroAnalista,
  opcoesHubs = [],
  opcoesModais = [],
  opcoesSemanas = [],
  opcoesAnalistas = [],
}: DashboardProps) {

  const [temaEscuro, setTemaEscuro] = useState(false);

  // ANALISTAS OCULTOS
  const nomesAnalistasOcultos = ['barbara targino'];
  const normalizarNomeAnalista = (nome: any) => String(nome || '').trim().toLowerCase();
  const analistaEstaOculto = (nome: any) => nomesAnalistasOcultos.includes(normalizarNomeAnalista(nome));
  const opcoesAnalistasVisiveis = opcoesAnalistas.filter(a => !analistaEstaOculto(a));

  // TRATAMENTO DOS ARRAYS SELECIONADOS
  const hubsSelecionados =
    filtroHub && filtroHub !== "TODOS" && filtroHub.trim() !== ""
      ? filtroHub.split(',').map(x => x.trim().toLowerCase())
      : [];

  const modaisSelecionados =
    filtroModal && filtroModal !== "TODOS" && filtroModal.trim() !== ""
      ? filtroModal.split(',').map(x => x.trim().toLowerCase())
      : [];

  const semanasSelecionadas =
    filtroSemana && filtroSemana !== "TODOS" && filtroSemana.trim() !== ""
      ? filtroSemana.split(',').map(x => x.trim().toLowerCase())
      : [];

  const analistasSelecionados =
    filtroAnalista && filtroAnalista !== "TODOS" && filtroAnalista.trim() !== ""
      ? filtroAnalista.split(',').map(x => x.trim().toLowerCase()).filter(x => !analistaEstaOculto(x))
      : [];

  // FILTRAGEM ACUMULATIVA
  const dadosEfetivos = useMemo(() => listaFiltradaDash.filter(m => {
    if (!m) return false;
    const valorHub = String(m.hub || m.Hub || m.filial || m.Filial || '').trim().toLowerCase();
    const matchHub = hubsSelecionados.length === 0 || hubsSelecionados.includes(valorHub);
    const valorModal = String(m.modal || m.veiculo || m.Modal || '').trim().toLowerCase();
    const matchModal = modaisSelecionados.length === 0 || modaisSelecionados.includes(valorModal);
    const valorSemana = String(m.weekend || m.semana || m.Weekend || m.Semana || '').trim().toLowerCase();
    const matchSemana = semanasSelecionadas.length === 0 || semanasSelecionadas.includes(valorSemana);
    const valorAnalista = String(m.analyst || m.analista || m.Analyst || m.Analista || '').trim().toLowerCase();
    const matchAnalista = analistasSelecionados.length === 0 || analistasSelecionados.includes(valorAnalista);
    return matchHub && matchModal && matchSemana && matchAnalista;
  }), [listaFiltradaDash, hubsSelecionados, modaisSelecionados, semanasSelecionadas, analistasSelecionados]);

  const totalLeads = dadosEfetivos.length;

  // DISPAROS FILTRADOS POR SEMANA
  const disparosEfetivos = useMemo(() => {
    if (!disparosData || disparosData.length === 0) return disparosRealizados || 0;
    if (semanasSelecionadas.length === 0) return disparosData.length;
    return disparosData.filter(d =>
      semanasSelecionadas.includes(d.semana.toLowerCase())
    ).length;
  }, [disparosData, semanasSelecionadas, disparosRealizados]);

  // CALCULO DOS CARDS PRINCIPAIS
  const totalTreinamentosCustomizado = dadosEfetivos.filter(m => {
    const st = String(m.status || m.Status || '').trim().toLowerCase();
    return (
      st.includes('integra') ||
      st.includes('ag. first trip') ||
      st.includes('atraso')
    );
  }).length;

  const totalFirstTrip = dadosEfetivos.filter(m => {
    const st = String(m.status || m.Status || '').trim().toLowerCase();
    return st === "first trip efetuada" || st.includes("first trip efetuada") || st === "efetuada";
  }).length;

  const totalTreinamentosAgendados = dadosEfetivos.filter(m => {
    const st = String(m.status || m.Status || '').trim().toLowerCase();
    return (
      st.includes('integra') ||
      st.includes('ag. first trip') ||
      st.includes('atraso') ||
      st.includes('nao compareceu') ||
      st.includes('não compareceu')
    );
  }).length;

  const totalCompareceram = dadosEfetivos.filter(m => {
    const st = String(m.status || m.Status || '').trim().toLowerCase();
    return (
      st === "first trip efetuada" ||
      st.includes("first trip efetuada") ||
      st === "efetuada" ||
      st.includes("ag. first trip") ||
      st.includes("atraso") ||
      st.includes("integra")
    );
  }).length;

  const totalNaoCompareceram = dadosEfetivos.filter(m => {
    const st = String(m.status || m.Status || '').trim().toLowerCase();
    return st.includes("nao compareceu") || st.includes("não compareceu");
  }).length;

  // Volumetria HUB recalculada dinamicamente
  const contagemHubs: { [key: string]: number } = {};
  dadosEfetivos.forEach(m => {
    const hb = m.hub || m.Hub || m.filial || m.Filial;
    if (hb) {
      const nomeHub = String(hb).trim();
      contagemHubs[nomeHub] = (contagemHubs[nomeHub] || 0) + 1;
    }
  });

  const hubsOrdenados = Object.keys(contagemHubs)
    .map(nome => ({
      name: nome,
      qtd: contagemHubs[nome],
      pct: totalLeads > 0 ? (contagemHubs[nome] / totalLeads) * 100 : 0
    }))
    .sort((a, b) => b.qtd - a.qtd);

  // Evolucao Semanal recalculada dinamicamente
  const contagemSemanas: { [key: string]: number } = {};
  dadosEfetivos.forEach(m => {
    const sem = String(m.weekend || m.semana || m.Weekend || m.Semana || '').trim();
    if (sem !== "") contagemSemanas[sem] = (contagemSemanas[sem] || 0) + 1;
  });

  const semanasOrdenadas = Object.keys(contagemSemanas)
    .map(nome => ({
      name: nome,
      total: contagemSemanas[nome]
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const colunasSemanasUnicas =
    semanasOrdenadas.map(s => s.name).length > 0
      ? semanasOrdenadas.map(s => s.name)
      : opcoesSemanas.filter(s => s && s !== "TODOS");

  // PERFORMANCE DOS ANALISTAS (memoized)
  const rankingConversao = useMemo(() => opcoesAnalistasVisiveis
    .filter(a => a && a !== "TODOS")
    .map(analista => {
      const convertidos = dadosEfetivos.filter(m => {
        const nome = String(m.analyst || m.analista || m.Analyst || m.Analista || '').trim().toLowerCase();
        const st = String(m.status || m.Status || '').trim().toLowerCase();
        return nome === analista.toLowerCase() && (
          st === "first trip efetuada" ||
          st.includes("first trip efetuada") ||
          st === "efetuada"
        );
      }).length;

      const total = dadosEfetivos.filter(m => {
        const nome = String(m.analyst || m.analista || m.Analyst || m.Analista || '').trim().toLowerCase();
        return nome === analista.toLowerCase();
      }).length;

      const textaNum = total > 0 ? (convertidos / total) * 100 : 0;
      return { nome: analista, convertidos, total, taxaStr: textaNum.toFixed(1), taxaNum: textaNum };
    })
    .sort((a, b) => b.taxaNum - a.taxaNum), [opcoesAnalistasVisiveis, dadosEfetivos]);

  const rankingAtendimentos = useMemo(() => opcoesAnalistasVisiveis
    .filter(a => a && a !== "TODOS")
    .map(analista => {
      const totalAtendimentos = dadosEfetivos.filter(m => {
        const nome = String(m.analyst || m.analista || m.Analyst || m.Analista || '').trim().toLowerCase();
        return nome === analista.toLowerCase();
      }).length;

      const shareVolStr = totalLeads > 0 ? ((totalAtendimentos / totalLeads) * 100).toFixed(1) : "0.0";
      return { nome: analista, totalAtendimentos, shareVolStr };
    })
    .sort((a, b) => b.totalAtendimentos - a.totalAtendimentos), [opcoesAnalistasVisiveis, dadosEfetivos, totalLeads]);

  // PROCESSAMENTO EXCLUSIVO E MAPEAMENTO CRUZA COMPLETO
  const {
    contagemStatusGlobais,
    cruzamentoStatusSemana,
    matrizHubSemana,
    matrizAnalistaSemana,
    contagemModaisGlobais,
    cruzamentoModalSemana,
  } = useMemo(() => {
    const _contagemStatusGlobais: { [key: string]: number } = {};
    const _cruzamentoStatusSemana: { [status: string]: { [semana: string]: number } } = {};
    const _matrizHubSemana: { [hub: string]: { [semana: string]: number } } = {};
    const _matrizAnalistaSemana: { [analista: string]: { [semana: string]: number } } = {};
    const _contagemModaisGlobais: { [key: string]: number } = {};
    const _cruzamentoModalSemana: { [modal: string]: { [semana: string]: number } } = {};

    dadosEfetivos.forEach(m => {
      let stRaw = String(m.status || m.Status || 'Sem Status').trim();
      if (!stRaw) stRaw = 'Sem Status';
      _contagemStatusGlobais[stRaw] = (_contagemStatusGlobais[stRaw] || 0) + 1;

      const hb = String(m.hub || m.Hub || m.filial || m.Filial || 'Outros').trim();
      const sem = String(m.weekend || m.semana || m.Weekend || m.Semana || 'Sem Semana').trim();
      const ana = String(m.analyst || m.analista || m.Analyst || m.Analista || 'Sem Analista').trim();

      let modalRaw = String(m.modal || m.Modal || 'Sem Modal').trim();
      if (!modalRaw) modalRaw = 'Sem Modal';
      _contagemModaisGlobais[modalRaw] = (_contagemModaisGlobais[modalRaw] || 0) + 1;

      if (!_cruzamentoStatusSemana[stRaw]) _cruzamentoStatusSemana[stRaw] = {};
      _cruzamentoStatusSemana[stRaw][sem] = (_cruzamentoStatusSemana[stRaw][sem] || 0) + 1;

      if (!_matrizHubSemana[hb]) _matrizHubSemana[hb] = {};
      _matrizHubSemana[hb][sem] = (_matrizHubSemana[hb][sem] || 0) + 1;

      if (!analistaEstaOculto(ana)) {
        if (!_matrizAnalistaSemana[ana]) _matrizAnalistaSemana[ana] = {};
        _matrizAnalistaSemana[ana][sem] = (_matrizAnalistaSemana[ana][sem] || 0) + 1;
      }

      if (!_cruzamentoModalSemana[modalRaw]) _cruzamentoModalSemana[modalRaw] = {};
      _cruzamentoModalSemana[modalRaw][sem] = (_cruzamentoModalSemana[modalRaw][sem] || 0) + 1;
    });

    return {
      contagemStatusGlobais: _contagemStatusGlobais,
      cruzamentoStatusSemana: _cruzamentoStatusSemana,
      matrizHubSemana: _matrizHubSemana,
      matrizAnalistaSemana: _matrizAnalistaSemana,
      contagemModaisGlobais: _contagemModaisGlobais,
      cruzamentoModalSemana: _cruzamentoModalSemana,
    };
  }, [dadosEfetivos]);

  const listaTodosStatusEncontrados = Object.keys(contagemStatusGlobais).sort(
    (a, b) => contagemStatusGlobais[b] - contagemStatusGlobais[a]
  );

  const listaTodosModaisEncontrados = Object.keys(contagemModaisGlobais).sort(
    (a, b) => contagemModaisGlobais[b] - contagemModaisGlobais[a]
  );

  const obterCorBolinhaStatus = (statusNome: string) => {
    const low = statusNome.toLowerCase();
    if (low.includes('ativo') || low.includes('efetuada') || low.includes('conclui')) return 'bg-emerald-500';
    if (low.includes('inativo') || low.includes('pendente')) return 'bg-yellow-500';
    if (low.includes('aguardando') || low.includes('espera') || low.includes('agendado')) return 'bg-zinc-400';
    if (low.includes('bloqueado') || low.includes('recusado') || low.includes('cancel')) return 'bg-rose-500';
    return 'bg-orange-500';
  };

  const limparTodosOsFiltros = () => {
    setFiltroHub("TODOS");
    setFiltroModal("TODOS");
    setFiltroSemana("TODOS");
    setFiltroAnalista("TODOS");
  };

  const temFiltroAtivo =
    (filtroHub && filtroHub !== "TODOS") ||
    (filtroModal && filtroModal !== "TODOS") ||
    (filtroSemana && filtroSemana !== "TODOS") ||
    (filtroAnalista && filtroAnalista !== "TODOS");

  const estilo = {
    fundo: 'bg-slate-50 text-slate-900',
    card: 'bg-white border-slate-200 shadow-sm',
    filtroContainer: 'bg-slate-100 border-slate-200/80',
    selectDropdown: 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50',
    menuFlutuante: 'bg-white border-slate-200 shadow-xl text-slate-800',
    itemHover: 'hover:bg-slate-100 text-slate-700',
    textoSecundario: 'text-slate-600',
    textoLabels: 'text-slate-400',
    barraFundo: 'bg-slate-200',
  };

  function MultiSelectFiltro({
    label,
    opcoes = [],
    valorString,
    onMudar
  }: {
    label: string;
    opcoes: string[];
    valorString: string;
    onMudar: (val: string) => void;
  }) {
    const [aberto, setAberto] = useState(false);
    const refContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
      function cliqueFora(e: MouseEvent) {
        if (refContainer.current && !refContainer.current.contains(e.target as Node)) {
          setAberto(false);
        }
      }
      document.addEventListener('mousedown', cliqueFora);
      return () => document.removeEventListener('mousedown', cliqueFora);
    }, []);

    const listaOpcoesLimpa = Array.from(
      new Set(
        opcoes
          .map(o => o ? String(o).trim() : "")
          .filter(o => o !== "" && o.toUpperCase() !== "TODOS")
      )
    );

    const flegadosAtuais =
      valorString && valorString !== "TODOS" && valorString.trim() !== ""
        ? valorString.split(',').map(x => x.trim())
        : [];

    const manipularCliqueOpcao = (opcao: string) => {
      if (!onMudar) return;
      if (opcao === "TODOS") { onMudar("TODOS"); return; }
      let novosFlegados = [...flegadosAtuais];
      const index = novosFlegados.findIndex(x => x.toLowerCase() === opcao.toLowerCase());
      if (index > -1) { novosFlegados.splice(index, 1); } else { novosFlegados.push(opcao); }
      if (novosFlegados.length === 0) { onMudar("TODOS"); } else { onMudar(novosFlegados.join(', ')); }
    };

    return (
      <div ref={refContainer} className="space-y-1 relative w-full">
        <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${estilo.textoLabels}`}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setAberto(!aberto)}
          aria-label={label}
          className={`w-full p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-all outline-none ${estilo.selectDropdown}`}
        >
          <span className="truncate pr-1">
            {flegadosAtuais.length === 0
              ? "TODOS"
              : flegadosAtuais.length === 1
                ? flegadosAtuais[0]
                : `${flegadosAtuais.length} selecionados`}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 text-zinc-500 ${aberto ? 'rotate-180 text-orange-500' : ''}`} />
        </button>

        {aberto && (
          <div className={`absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border p-1 divide-y divide-zinc-800/10 shadow-xl ${estilo.menuFlutuante}`}>
            <div
              onClick={() => manipularCliqueOpcao("TODOS")}
              className={`flex items-center gap-2 px-2.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${estilo.itemHover}`}
            >
              <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${flegadosAtuais.length === 0 ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-500'}`}>
                {flegadosAtuais.length === 0 && <Check className="w-2.5 h-2.5 stroke-[4]" />}
              </div>
              <span>TODOS</span>
            </div>
            {listaOpcoesLimpa.map((opt, i) => {
              const checked = flegadosAtuais.some(x => x.toLowerCase() === opt.toLowerCase());
              return (
                <div
                  key={i}
                  onClick={() => manipularCliqueOpcao(opt)}
                  className={`flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${estilo.itemHover}`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${checked ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-500'}`}>
                    {checked && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                  </div>
                  <span className="truncate">{opt}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // HELPER: extrair porcentagem de string como "04h56min de 9h (54,8%)"
  const extrairPctEficiencia = (str: string): number => {
    const match = String(str || '').match(/\((\d+[,.]?\d*)%\)/);
    if (match) return Number(match[1].replace(',', '.'));
    return 0;
  };

  return (
    <div className={`p-3 lg:p-5 rounded-2xl min-h-screen transition-colors duration-300 ${estilo.fundo}`}>

      {/* Print + Landscape styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          * { background: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; box-shadow: none !important; }
          [class*="bg-gradient-to-t"], [class*="bg-emerald-"], [class*="bg-orange-"], [class*="bg-purple-"], [class*="bg-blue-"], [class*="bg-rose-"], [class*="bg-yellow-"], [class*="bg-zinc-400"], [class*="bg-\\[#EE4D2D\\]"], [class*="bg-\\[#d44022\\]"] { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          thead tr, thead th { background: #EE4D2D !important; color: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .overflow-x-auto, .overflow-y-auto, .overflow-hidden { overflow: visible !important; max-height: none !important; }
          .print\\:h-auto { height: auto !important; }
          .print\\:max-h-none { max-height: none !important; }
          .print\\:overflow-visible { overflow: visible !important; }
          [class*="h-[310px]"], [class*="h-[350px]"], [class*="h-[480px]"], [class*="max-h-[240px]"], [class*="h-40"], [class*="h-36"], [class*="h-56"] { height: auto !important; max-height: none !important; }
          body, html { width: 100% !important; }
        }
        @media (orientation: landscape) and (min-width: 1200px) {
          .landscape-6-cols { grid-template-columns: repeat(6, minmax(0, 1fr)) !important; }
        }
      `}</style>

      {/* CABECALHO */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 print:hidden">
        <h1 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-[#1d4ed8] flex items-center gap-2">
          <Activity className="w-5 h-5" /> Dashboard drivers day
        </h1>
        <button
          onClick={() => window.print()}
          aria-label="Baixar em PDF"
          className="flex items-center gap-2 bg-[#EE4D2D] hover:bg-[#d44022] text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Baixar em PDF
        </button>
      </div>

      <div className="space-y-5">
        {/* FILTROS */}
        <div className={`border p-3 lg:p-4 rounded-2xl flex flex-col gap-3 print:hidden ${estilo.filtroContainer}`}>
          <div className="flex items-center justify-between">
            <p className={`text-[16px] lg:text-[18px] font-black tracking-wider uppercase flex items-center gap-1.5 text-[#EE4D2D]`}>
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              Painel Geral de Filtros
            </p>
            {temFiltroAtivo && (
              <button onClick={limparTodosOsFiltros} aria-label="Limpar todos os filtros" className="text-xs font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors">
                <FilterX className="w-3.5 h-3.5" /> Limpar Filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MultiSelectFiltro label="Filtrar por HUB" opcoes={opcoesHubs} valorString={filtroHub} onMudar={setFiltroHub} />
            <MultiSelectFiltro label="Filtrar por Veiculo" opcoes={opcoesModais} valorString={filtroModal} onMudar={setFiltroModal} />
            <MultiSelectFiltro label="Filtrar por Semana" opcoes={opcoesSemanas} valorString={filtroSemana} onMudar={setFiltroSemana} />
            <MultiSelectFiltro label="Filtrar por Analista" opcoes={opcoesAnalistasVisiveis} valorString={filtroAnalista} onMudar={setFiltroAnalista} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* CARDS PRINCIPAIS — LANDSCAPE: 6 em uma unica linha em telas largas */}
        {/* ============================================================ */}
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3 landscape-6-cols">
          {/* CARD 1: DISPAROS */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${estilo.card}`}>
            <div className="p-2.5 rounded-xl bg-zinc-500/10 text-zinc-500 shrink-0"><Activity className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#18181b] leading-tight">TOTAL DISPAROS REALIZADOS</p>
              <h3 className="text-xl 2xl:text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-1.5">
                <span style={{ color: '#18181b' }}>{Number(disparosEfetivos || 0).toLocaleString("pt-BR")}</span>
                <span className="text-[11px] font-bold text-zinc-500">/ 100%</span>
              </h3>
            </div>
          </div>
          {/* CARD 2: LEADS */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${estilo.card}`}>
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 shrink-0"><Users className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#18181b] leading-tight">Leads Responderam</p>
              <h3 className="text-xl 2xl:text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-1.5">
                <span style={{ color: '#18181b' }}>{totalLeads}</span>
                <span className="text-[11px] font-bold text-orange-500">/ {disparosEfetivos > 0 ? ((totalLeads / disparosEfetivos) * 100).toFixed(1) : "0.0"}%</span>
              </h3>
            </div>
          </div>
          {/* CARD 3: AGENDADOS */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${estilo.card}`}>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 shrink-0"><Activity className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0046B5] leading-tight">Treinamentos Agendados</p>
              <h3 className="text-xl 2xl:text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-1.5">
                <span style={{ color: '#18181b' }}>
                  {dadosEfetivos.filter(m => {
                    const st = String(m.status || m.Status || '').trim().toLowerCase();
                    return (st === "ag. integração/treinamento" || st === "ag. integracao/treinamento" || st === "não compareceu" || st === "nao compareceu" || st === "sem vagas hub" || st === "ag. first trip" || st === "first trip em atraso" || st === "first trip efetuada" || st === "efetuada" || st === "");
                  }).length}
                </span>
                <span className="text-[11px] font-bold text-purple-600">
                  / {disparosEfetivos > 0
                    ? ((dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return (st === "ag. integração/treinamento" || st === "ag. integracao/treinamento" || st === "não compareceu" || st === "nao compareceu" || st === "ag. first trip" || st === "first trip em atraso" || st === "sem vagas hub" || st === "first trip efetuada" || st === "efetuada" || st === ""); }).length / disparosEfetivos) * 100).toFixed(1) : "0.0"}%
                </span>
              </h3>
            </div>
          </div>
          {/* CARD 4: COMPARECERAM */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${estilo.card}`}>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0"><Calendar className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0046B5] leading-tight">Compareceram ao Treinamento</p>
              <h3 className="text-xl 2xl:text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-1.5">
                <span style={{ color: '#18181b' }}>
                  {dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return (st === "first trip efetuada" || st === "efetuada" || st === "ag. first trip" || st === "first trip em atraso" || st === "atraso" || st === ""); }).length}
                </span>
                <span className="text-[11px] font-bold text-blue-500">
                  / {(() => { const c = dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return (st === "first trip efetuada" || st === "efetuada" || st === "ag. first trip" || st === "first trip em atraso" || st === "atraso" || st === ""); }).length; return disparosEfetivos > 0 ? ((c / disparosEfetivos) * 100).toFixed(1) : "0.0"; })()}%
                </span>
              </h3>
            </div>
          </div>
          {/* CARD 5: FIRST TRIP */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${estilo.card}`}>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0"><CheckCircle className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#0046B5] leading-tight">First Trip Efetuada</p>
              <h3 className="text-xl 2xl:text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-1.5">
                <span style={{ color: '#18181b' }}>{totalFirstTrip}</span>
                <span className="text-[11px] font-bold text-emerald-500">/ {disparosEfetivos > 0 ? ((totalFirstTrip / disparosEfetivos) * 100).toFixed(1) : "0.0"}%</span>
              </h3>
            </div>
          </div>
          {/* CARD 6: MEDIA ATENDIMENTOS — DIRETO DA CELULA F6 */}
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${estilo.card}`}>
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500 shrink-0"><UserCheck className="w-5 h-5" /></div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#D44125] leading-tight">Media Atend/Dia/Analista</p>
              <h3 className="text-xl 2xl:text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-1.5">
                <span style={{ color: '#18181b' }}>
                  {mediaAtendimentoAnalista > 0
                    ? mediaAtendimentoAnalista.toFixed(1).replace(".", ",")
                    : (atendGerais?.mediaDiaAnalista || "0,0")
                  }
                </span>
                <span className="text-[11px] font-bold text-blue-500">por dia</span>
              </h3>
            </div>
          </div>
        </div>

        {/* TAXAS DE CONVERSAO — 5 MINI-CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {(() => {
            const tDisparos = Number(disparosEfetivos || 0);
            const tAgendados = dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return (st === "ag. integração/treinamento" || st === "ag. integracao/treinamento" || st === "não compareceu" || st === "nao compareceu" || st === "sem vagas hub" || st === "ag. first trip" || st === "first trip em atraso" || st === "first trip efetuada" || st === "efetuada" || st === ""); }).length;
            const tCompareceram = dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return (st === "first trip efetuada" || st === "efetuada" || st === "ag. first trip" || st === "first trip em atraso" || st === "atraso" || st === ""); }).length;
            const tNaoCompareceram = dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return st.includes("nao compareceu") || st.includes("não compareceu"); }).length;
            const tFirstTrip = totalFirstTrip || 0;

            const taxaRespostaDisparos = tDisparos > 0 ? ((totalLeads / tDisparos) * 100) : 0;
            const taxaAgendamentoDisparos = tDisparos > 0 ? ((tAgendados / tDisparos) * 100) : 0;
            const taxaComparecimentoDisparos = tDisparos > 0 ? ((tCompareceram / tDisparos) * 100) : 0;
            const taxaFirstTripDisparos = tDisparos > 0 ? ((tFirstTrip / tDisparos) * 100) : 0;
            const taxaNaoCompareceuDisparos = tDisparos > 0 ? ((tNaoCompareceram / tDisparos) * 100) : 0;

            const minicards = [
              { titulo: "Taxa de Resposta", subtitulo: "Leads / Disparos", valor: taxaRespostaDisparos, cor: "text-orange-600", bordaCor: "border-orange-500/30", bgCor: "bg-orange-500/5" },
              { titulo: "Taxa de Agendamento", subtitulo: "Agendados / Disparos", valor: taxaAgendamentoDisparos, cor: "text-purple-600", bordaCor: "border-purple-500/30", bgCor: "bg-purple-500/5" },
              { titulo: "Taxa de Comparecimento", subtitulo: "Compareceram / Disparos", valor: taxaComparecimentoDisparos, cor: "text-blue-600", bordaCor: "border-blue-500/30", bgCor: "bg-blue-500/5" },
              { titulo: "Taxa de First Trip", subtitulo: "First Trip / Disparos", valor: taxaFirstTripDisparos, cor: "text-emerald-600", bordaCor: "border-emerald-500/30", bgCor: "bg-emerald-500/5" },
              { titulo: "Nao Comparecimento", subtitulo: "Ausentes / Disparos", valor: taxaNaoCompareceuDisparos, cor: "text-red-600", bordaCor: "border-red-500/30", bgCor: "bg-red-500/5" },
            ];

            const coresInline: Record<string, string> = {
              "text-orange-600": "#ea580c",
              "text-purple-600": "#9333ea",
              "text-blue-600": "#2563eb",
              "text-emerald-600": "#059669",
              "text-red-600": "#dc2626",
            };

            return minicards.map((card, i) => (
              <div key={i} className={`p-3 rounded-2xl border text-center ${estilo.card} ${card.bordaCor} ${card.bgCor}`}>
                <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ color: '#52525b' }}>{card.titulo}</p>
                <p className="text-2xl font-black" style={{ color: coresInline[card.cor] || '#18181b' }}>{card.valor.toFixed(1)}%</p>
                <p className="text-[9px] mt-0.5" style={{ color: '#71717a' }}>{card.subtitulo}</p>
              </div>
            ));
          })()}
        </div>

        {/* PERFORMANCE POR ANALISTA — LANDSCAPE: lado a lado */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            <div className={`p-4 rounded-2xl border flex flex-col justify-between h-[310px] print:h-auto ${estilo.card}`}>
              <div className="w-full">
                <div className="flex items-center gap-2 text-orange-500 mb-3">
                  <Target className="w-5 h-5" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5722]">TREINADOS X FRIST TRIP POR ANALISTA (CONVERSAO)</h4>
                </div>
                <div className="divide-y divide-zinc-800/10 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin space-y-0.5 print:max-h-none print:overflow-visible">
                  {rankingConversao.length > 0 ? (
                    rankingConversao.map((analista, idx) => {
                      const agendadosAnalista = dadosEfetivos.filter(m => {
                        const nome = String(m.analyst || m.analista || m.Analyst || m.Analista || '').trim().toLowerCase();
                        const st = String(m.status || m.Status || '').trim().toLowerCase();
                        return nome === analista.nome.toLowerCase() && (st.includes('integra') || st.includes('ag. first trip') || st.includes('atraso') || st.includes('nao compareceu') || st.includes('não compareceu') || st === "first trip efetuada" || st.includes("first trip efetuada") || st === "efetuada");
                      }).length;
                      const novaTaxa = agendadosAnalista > 0 ? ((analista.convertidos / agendadosAnalista) * 100).toFixed(1) : "0.0";
                      return (
                        <div key={analista.nome} className="flex justify-between items-center text-xs py-2 px-1 rounded-lg hover:bg-zinc-500/5 transition-colors font-semibold">
                          <span className="truncate max-w-[150px] text-slate-700">{idx + 1}. {analista.nome}</span>
                          <div className="flex items-center gap-3 font-mono text-right">
                            <span className="text-[11px] font-medium text-slate-500">{analista.convertidos}/{agendadosAnalista}</span>
                            <span className="font-black text-orange-500 min-w-[45px]">{novaTaxa}%</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (<p className="text-xs italic text-zinc-500">Aguardando dados...</p>)}
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border flex flex-col justify-between h-[310px] print:h-auto ${estilo.card}`}>
              <div className="w-full">
                <div className="flex items-center gap-2 text-orange-500 mb-3">
                  <BarChart3 className="w-5 h-5" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5722]">Atendimentos REALIZADOS por Analista</h4>
                </div>
                <div className="divide-y divide-zinc-800/10 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin space-y-0.5 print:max-h-none print:overflow-visible">
                  {rankingAtendimentos.length > 0 ? (
                    rankingAtendimentos.map((analista, idx) => (
                      <div key={analista.nome} className="flex justify-between items-center text-xs py-2 px-1 rounded-lg hover:bg-zinc-500/5 transition-colors font-semibold">
                        <span className="truncate max-w-[150px] text-slate-700">{idx + 1}. {analista.nome}</span>
                        <div className="flex items-center gap-2 font-mono text-right">
                          <span className="text-zinc-500 text-[10px] hidden sm:inline">Vol.</span>
                          <span className="font-black text-blue-400 min-w-[55px]">{analista.totalAtendimentos} <span className="text-[10px] text-zinc-600 font-normal">({analista.shareVolStr}%)</span></span>
                        </div>
                      </div>
                    ))
                  ) : (<p className="text-xs italic text-zinc-500">Aguardando dados...</p>)}
                </div>
              </div>
            </div>
          </div>

          {/* RANKING FIRST TRIP POR ANALISTA */}
          <div className={`p-4 rounded-2xl border flex flex-col justify-between h-[310px] print:h-auto ${estilo.card}`}>
            <div className="w-full">
              <div className="flex items-center gap-2 text-orange-500 mb-3">
                <BarChart3 className="w-5 h-5 text-emerald-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5722]">FIRST TRIP EFETUADA por Analista</h4>
              </div>
              <div className="divide-y divide-zinc-800/10 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin space-y-0.5 print:max-h-none print:overflow-visible">
                {(() => {
                  const contagem: Record<string, number> = {};
                  let totalGeralFT = 0;
                  if (Array.isArray(dadosEfetivos)) {
                    dadosEfetivos.forEach((m: any) => {
                      const st = String(m?.status || m?.Status || '').trim().toLowerCase();
                      if (st === "first trip efetuada" || st.includes("first trip efetuada") || st === "efetuada") {
                        const nomeAnalista = String(m?.analyst || m?.analista || m?.Analyst || m?.Analista || 'Nao Informado').trim();
                        if (!analistaEstaOculto(nomeAnalista)) { contagem[nomeAnalista] = (contagem[nomeAnalista] || 0) + 1; totalGeralFT++; }
                      }
                    });
                  }
                  const listaRankeada = Object.entries(contagem).map(([nome, total]) => ({ nome, totalFirstTrip: total, shareStr: totalGeralFT > 0 ? ((total / totalGeralFT) * 100).toFixed(1) : "0.0" })).sort((a, b) => b.totalFirstTrip - a.totalFirstTrip);
                  if (listaRankeada.length > 0) {
                    return listaRankeada.map((analista, idx) => (
                      <div key={analista.nome} className="flex justify-between items-center text-xs py-2 px-1 rounded-lg hover:bg-zinc-500/5 transition-colors font-semibold">
                        <span className="truncate max-w-[150px] text-slate-700">{idx + 1}. {analista.nome}</span>
                        <div className="flex items-center gap-2 font-mono text-right">
                          <span className="font-black text-emerald-400 min-w-[55px]">{analista.totalFirstTrip} <span className="text-[10px] text-zinc-600 font-normal">({analista.shareStr}%)</span></span>
                        </div>
                      </div>
                    ));
                  }
                  return <p className="text-xs italic text-zinc-500">Aguardando dados...</p>;
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* FUNIL & EVOLUCAO — LANDSCAPE */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-stretch">
          {/* Funil Operacional */}
          <div className={`p-4 rounded-3xl border h-[480px] lg:col-span-1 flex flex-col justify-between ${estilo.card}`}>
            {(() => {
              const tDisparos = Number(disparosEfetivos || 0);
              const tLeads = totalLeads || 0;
              const tAgendados = dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return (st === "ag. integração/treinamento" || st === "ag. integracao/treinamento" || st === "não compareceu" || st === "nao compareceu" || st === "sem vagas hub" || st === "ag. first trip" || st === "first trip em atraso" || st === "first trip efetuada" || st === ""); }).length;
              const tCompareceram = dadosEfetivos.filter(m => { const st = String(m.status || m.Status || '').trim().toLowerCase(); return (st === "first trip efetuada" || st === "efetuada" || st === "ag. first trip" || st === "first trip em atraso" || st === "atraso" || st === ""); }).length;
              const tFirstTrip = totalFirstTrip || 0;
              const somaValores = tAgendados + tCompareceram + tFirstTrip;
              const circumference = 138.23;
              const fAgendados = somaValores > 0 ? (tAgendados / somaValores) * circumference : circumference / 3;
              const fCompareceram = somaValores > 0 ? (tCompareceram / somaValores) * circumference : circumference / 3;
              const fFirstTrip = somaValores > 0 ? (tFirstTrip / somaValores) * circumference : circumference / 3;
              const oAgendados = 0;
              const oCompareceram = fAgendados;
              const oFirstTrip = fAgendados + fCompareceram;
              const obterCentroGomo = (offsetAcumulado: number, tamanhoFatia: number) => {
                if (somaValores === 0) return { x: 32, y: 32 };
                const pctMeio = ((offsetAcumulado + tamanhoFatia / 2) / circumference) * 100;
                const anguloRad = ((pctMeio * 3.6 - 90) * Math.PI) / 180;
                return { x: (32 + 22 * Math.cos(anguloRad)).toFixed(1), y: (32 + 22 * Math.sin(anguloRad)).toFixed(1) };
              };
              const txtAgendados = obterCentroGomo(oAgendados, fAgendados);
              const txtCompareceram = obterCentroGomo(oCompareceram, fCompareceram);
              const txtFirstTrip = obterCentroGomo(oFirstTrip, fFirstTrip);

              return (
                <div className="space-y-3 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-[#0046B5]">
                    <BarChart3 className="w-5 h-5" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Funil Operacional</h4>
                  </div>
                  <div className="flex flex-col items-center justify-center flex-1 pt-1 gap-4">
                    <div className="relative w-40 h-40 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
                      <svg className="w-full h-full" viewBox="0 0 64 64">
                        {tAgendados > 0 && (<circle cx="32" cy="32" r="22" fill="transparent" stroke="#a855f7" strokeWidth="11" strokeDasharray={`${fAgendados} ${circumference}`} strokeDashoffset={`-${oAgendados}`} className="transform -rotate-90 origin-center" />)}
                        {tCompareceram > 0 && (<circle cx="32" cy="32" r="22" fill="transparent" stroke="#3b82f6" strokeWidth="11" strokeDasharray={`${fCompareceram} ${circumference}`} strokeDashoffset={`-${oCompareceram}`} className="transform -rotate-90 origin-center" />)}
                        {tFirstTrip > 0 && (<circle cx="32" cy="32" r="22" fill="transparent" stroke="#10b981" strokeWidth="11" strokeDasharray={`${fFirstTrip} ${circumference}`} strokeDashoffset={`-${oFirstTrip}`} className="transform -rotate-90 origin-center" />)}
                        {tAgendados > 0 && fAgendados > 10 && (<text x={txtAgendados.x} y={txtAgendados.y} fill="#ffffff" fontSize="3.5" fontWeight="900" textAnchor="middle" dominantBaseline="central" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{tAgendados}</text>)}
                        {tCompareceram > 0 && fCompareceram > 10 && (<text x={txtCompareceram.x} y={txtCompareceram.y} fill="#ffffff" fontSize="3.5" fontWeight="900" textAnchor="middle" dominantBaseline="central" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{tCompareceram}</text>)}
                        {tFirstTrip > 0 && fFirstTrip > 10 && (<text x={txtFirstTrip.x} y={txtFirstTrip.y} fill="#ffffff" fontSize="3.5" fontWeight="900" textAnchor="middle" dominantBaseline="central" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{tFirstTrip}</text>)}
                      </svg>
                      <div className="absolute w-16 h-16 rounded-full flex flex-col items-center justify-center bg-white shadow-md border border-zinc-500/10">
                        <span className="text-lg font-black text-[#0046B5]">{tLeads}</span>
                        <p className="text-[7px] uppercase tracking-wider text-zinc-400 font-black">Total Leads</p>
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-zinc-500 shrink-0" /><span className={estilo.textoSecundario}>Disparos</span></div><span className="font-black" style={{ color: '#18181b' }}>{tDisparos.toLocaleString("pt-BR")}</span></div>
                      <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" /><span className={estilo.textoSecundario}>Leads</span></div><span className="font-black" style={{ color: '#18181b' }}>{tLeads}</span></div>
                      <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" /><span className={estilo.textoSecundario}>Agendados</span></div><span className="font-black" style={{ color: '#18181b' }}>{tAgendados}</span></div>
                      <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /><span className={estilo.textoSecundario}>Compareceram</span></div><span className="font-black" style={{ color: '#18181b' }}>{tCompareceram}</span></div>
                      <div className="flex items-center justify-between text-xs font-bold pb-0.5"><div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /><span className={estilo.textoSecundario}>First Trip</span></div><span className="font-black" style={{ color: '#18181b' }}>{tFirstTrip}</span></div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Evolucao de Respostas por Semana */}
          <div className={`p-4 rounded-2xl border h-full flex flex-col justify-between lg:col-span-3 ${estilo.card}`}>
            <div className="space-y-4 flex-1 flex flex-col w-full">
              <div className="flex items-center gap-2 justify-center w-full border-b pb-2 border-zinc-100">
                <TrendingUp className="w-5 h-5 text-[#0046B5]" />
                <h4 className="text-sm font-black uppercase tracking-wider text-[#0046B5] text-center">Evolucao de Respostas por Semana</h4>
              </div>
              <div className="w-full overflow-x-auto pb-4 pt-2">
                <div className="flex items-end justify-center gap-3 sm:gap-5 min-w-max px-4 h70">
                  {semanasOrdenadas.length > 0 ? (
                    [...semanasOrdenadas]
                      .filter((sem) => { const nome = String(sem?.name || "").trim(); const match = nome.match(/\d+/); const n = match ? Number(match[0]) : null; if (!n) return true; const hoje = new Date(); const ini = new Date(hoje.getFullYear(), 0, 1); const diff = Math.floor((hoje.getTime() - ini.getTime()) / (1000 * 60 * 60 * 24)); const sa = Math.ceil((diff + ini.getDay() + 1) / 7); return n <= sa; })
                      .sort((a, b) => { const sa = Number(String(a?.name || "").match(/\d+/)?.[0] || 0); const sb = Number(String(b?.name || "").match(/\d+/)?.[0] || 0); return sb - sa; })
                      .map((sem, idx) => {
                        const porcentagem = totalLeads > 0 ? (sem.total / totalLeads) * 100 : 0;
                        return (
                          <div key={idx} className="flex flex-col items-center w-14 sm:w-16 justify-end group">
                            <div className="mb-2 text-center flex flex-col items-center justify-end h-10 shrink-0">
                              <span className="text-[14px] font-black text-zinc-800 whitespace-nowrap">{sem.total}</span>
                              <span className="text-[12px] font-bold text-orange-400">{porcentagem.toFixed(1)}%</span>
                            </div>
                            <div className="w-7 sm:w-7 h-36 rounded-full bg-zinc-100 overflow-hidden relative shrink-0 shadow-inner">
                              <div className="bg-gradient-to-t from-orange-600 to-orange-500 w-full rounded-full absolute bottom-0 left-0 transition-all duration-500 group-hover:from-orange-500 group-hover:to-orange-400" style={{ height: `${totalLeads > 0 ? Math.max(18, Math.min(porcentagem * 5.35, 100)) : 18}%` }} />
                            </div>
                            <div className="mt-2 text-center shrink-0">
                              <span className="text-[13px] font-black font-mono text-zinc-500 whitespace-nowrap">{sem.name}</span>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="flex items-center justify-center h-full w-full py-8"><p className="text-xs text-zinc-500 italic text-center">Nenhuma semana localizada.</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAIS E HUBS */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-stretch w-full">
          {/* Respostas por Modal */}
          <div className={`p-4 rounded-3xl border flex flex-col justify-between lg:col-span-1 ${estilo.card}`}>
            <div className="space-y-6">
              <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-[#FF5722]">Respostas por Modal</h4>
              <div className="space-y-5">
                {(() => {
                  const modaisFiltrados = modaisPagina2.filter(modal => modal.qtd > 0);
                  if (!modaisFiltrados || modaisFiltrados.length === 0) return <p className="text-xs italic text-zinc-500">Nenhum modal encontrado.</p>;
                  const totalGeralModais = modaisFiltrados.reduce((acc, curr) => acc + (curr.qtd || 0), 0);
                  const coresShopee = ["bg-[#FF5722]", "bg-[#FF7A45]", "bg-[#FFA366]", "bg-[#FFB88C]", "bg-zinc-500"];
                  const modaisOrdenados = [...modaisFiltrados].sort((a, b) => b.qtd - a.qtd);
                  return modaisOrdenados.map((modal, i) => {
                    const pctReal = totalGeralModais > 0 ? (modal.qtd / totalGeralModais) * 100 : 0;
                    const corBarra = coresShopee[i % coresShopee.length];
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="uppercase text-[12px] text-zinc-800">{modal.name}</span>
                          <span className="text-blue-700">{modal.qtd} un <span className="text-[#FF5722]">({pctReal.toFixed(1)}%)</span></span>
                        </div>
                        <div className={`w-full h-2 rounded-full overflow-hidden ${estilo.barraFundo}`}><div className={`${corBarra} h-full rounded-full`} style={{ width: `${pctReal}%` }} /></div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* Respostas por HUB */}
          <div className={`p-4 rounded-3xl border flex flex-col justify-between lg:col-span-3 ${estilo.card}`}>
            <div className="space-y-3 flex-1 flex flex-col justify-between h-full">
              <h4 className="text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 text-[#FF5722] text-center w-full">Respostas por HUB</h4>
              <div className="w-full overflow-x-auto pb-2 pt-2">
                <div className="flex items-end justify-start sm:justify-center gap-3 sm:gap-5 min-w-max px-4 h-48">
                  {hubsOrdenados && hubsOrdenados.length > 0 ? (
                    hubsOrdenados.map((hub, i) => (
                      <div key={i} className="flex flex-col items-center w-14 sm:w-16 justify-end group">
                        <div className="mb-2 text-center flex flex-col items-center justify-end h-8 shrink-0">
                          <span className="text-[13px] font-black text-zinc-900 whitespace-nowrap">{hub.qtd}</span>
                          <span className="text-[11px] font-bold text-orange-600">{hub.pct.toFixed(0)}%</span>
                        </div>
                        <div className="w-7 sm:w-7 h-32 rounded-full overflow-hidden relative shrink-0 bg-zinc-100 shadow-inner">
                          <div className="bg-gradient-to-t from-blue-600 to-blue-500 w-full rounded-full absolute bottom-0 left-0 transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-400" style={{ height: `${hub.pct > 0 ? Math.max(18, Math.min(hub.pct * .35, 100)) : 18}%` }} />
                        </div>
                        <div className="mt-2 text-center shrink-0 w-full max-w-[100px] truncate">
                          <span className="text-[11px] font-bold text-zinc-600" title={hub.name}>{hub.name}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full w-full py-8"><p className="text-xs text-zinc-500 italic text-center">Nenhum HUB localizado.</p></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TABELAS — LANDSCAPE: 3 lado a lado */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 text-zinc-800">
            <Activity className="w-5 h-5 text-[#EE4D2D]" />
            <h3 className="text-lg lg:text-xl font-bold text-[#0046B5] uppercase tracking-wider">Metricas Customizadas por Modal e Semana</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Tabela Modal x Semana */}
            <div className={`p-3 rounded-2xl border flex flex-col h-[320px] print:h-auto ${estilo.card} border-zinc-200`}>
              <div className="mb-2"><h4 className="text-[12px] font-bold uppercase tracking-wider text-blue-700">RESPOSTAS LEADS POR MODAL E SEMANA</h4></div>
              <div className="w-full flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-zinc-200 pr-1 scrollbar-thin print:max-h-none print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse min-w-[380px]">
                  <thead className="sticky top-0 z-30">
                    <tr className="bg-[#EE4D2D] text-white border-b border-[#EE4D2D]">
                      <th className="p-2 text-left bg-[#EE4D2D] font-bold text-[10px] tracking-wider sticky left-0 z-40 min-w-[120px] border-r border-white/10">MODAL</th>
                      <th className="p-2 font-bold text-[10px] tracking-wider text-center min-w-[80px] bg-[#EE4D2D]">TOTAL</th>
                      {colunasSemanasUnicas.map((semanaNome, i) => (<th key={i} className="p-2 text-center font-bold text-[10px] tracking-wider min-w-[65px] bg-[#EE4D2D]">{semanaNome.toUpperCase()}</th>))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-[11px] text-zinc-700">
                    {listaTodosModaisEncontrados.length > 0 ? (
                      listaTodosModaisEncontrados.map((modalNome, idx) => {
                        const totalDoModal = contagemModaisGlobais[modalNome] || 0;
                        const pctGeral = totalLeads > 0 ? (totalDoModal / totalLeads) * 100 : 0;
                        return (
                          <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-2 font-semibold truncate sticky left-0 bg-white/95 text-zinc-900 z-20 border-r border-zinc-200" title={modalNome}>{modalNome}</td>
                            <td className="p-2 text-center font-bold font-mono bg-zinc-500/5 text-[#EE4D2D]">{totalDoModal} <span className="text-zinc-400 text-[10px] font-normal">({pctGeral.toFixed(0)}%)</span></td>
                            {colunasSemanasUnicas.map((semanaNome, i) => {
                              const qtd = (cruzamentoModalSemana[modalNome] && cruzamentoModalSemana[modalNome][semanaNome]) || 0;
                              const pct = totalDoModal > 0 ? (qtd / totalDoModal) * 100 : 0;
                              return (<td key={i} className="p-2 text-center font-mono text-zinc-700">{qtd > 0 ? (<span><span className="font-bold">{qtd}</span><span className="text-zinc-400 text-[9px] ml-0.5">({pct.toFixed(0)}%)</span></span>) : (<span className="text-zinc-300">-</span>)}</td>);
                            })}
                          </tr>
                        );
                      })
                    ) : (<tr><td colSpan={colunasSemanasUnicas.length + 2} className="p-4 text-center text-zinc-400 italic">Sem registros.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela HUB x Semana */}
            <div className={`p-3 rounded-2xl border flex flex-col h-[320px] print:h-auto ${estilo.card} border-zinc-200`}>
              <div className="mb-2"><h4 className="text-[12px] font-bold uppercase tracking-wider text-blue-700">RESPOSTAS LEADS POR HUB E SEMANA</h4></div>
              <div className="w-full flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-zinc-200 pr-1 scrollbar-thin print:max-h-none print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse min-w-[380px]">
                  <thead className="sticky top-0 z-30">
                    <tr className="bg-[#EE4D2D] text-white border-b border-[#EE4D2D]">
                      <th className="p-2 text-left bg-[#EE4D2D] font-bold text-[10px] tracking-wider sticky left-0 z-40 min-w-[120px] border-r border-white/10">HUB</th>
                      <th className="p-2 font-bold text-[10px] tracking-wider text-center min-w-[80px] bg-[#EE4D2D]">TOTAL</th>
                      {colunasSemanasUnicas.map((semanaNome, i) => (<th key={i} className="p-2 text-center font-bold text-[10px] tracking-wider min-w-[65px] bg-[#EE4D2D]">{semanaNome.toUpperCase()}</th>))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-[11px] text-zinc-700">
                    {Object.keys(matrizHubSemana).length > 0 ? (
                      Object.keys(matrizHubSemana).sort((a, b) => { const tA = Object.values(matrizHubSemana[a]).reduce((acc, val) => acc + val, 0); const tB = Object.values(matrizHubSemana[b]).reduce((acc, val) => acc + val, 0); return tB - tA; }).map((hubKey, idx) => {
                        const totalHub = Object.values(matrizHubSemana[hubKey]).reduce((a, b) => a + b, 0) || 0;
                        const pctHub = totalLeads > 0 ? (totalHub / totalLeads) * 100 : 0;
                        return (
                          <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-2 font-semibold bg-white/95 text-zinc-900 sticky left-0 z-20 border-r border-zinc-200 truncate" title={hubKey}>{hubKey}</td>
                            <td className="p-2 text-center font-bold font-mono bg-zinc-500/5 text-[#EE4D2D]">{totalHub} <span className="text-zinc-400 text-[10px] font-normal">({pctHub.toFixed(0)}%)</span></td>
                            {colunasSemanasUnicas.map((semanaNome, i) => {
                              const val = matrizHubSemana[hubKey][semanaNome] || 0;
                              const pct = totalHub > 0 ? (val / totalHub) * 100 : 0;
                              return (<td key={i} className="p-2 text-center font-mono text-zinc-700">{val > 0 ? (<span><span className="font-bold">{val}</span><span className="text-zinc-400 text-[9px] ml-0.5">({pct.toFixed(0)}%)</span></span>) : (<span className="text-zinc-300">-</span>)}</td>);
                            })}
                          </tr>
                        );
                      })
                    ) : (<tr><td colSpan={colunasSemanasUnicas.length + 2} className="p-4 text-center text-zinc-400 italic">Sem registros.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabela Analista x Semana */}
            <div className={`p-3 rounded-2xl border flex flex-col h-[320px] print:h-auto ${estilo.card} border-zinc-200`}>
              <div className="mb-2"><h4 className="text-[12px] font-bold uppercase tracking-wider text-blue-700">RESPOSTAS LEADS POR ANALISTA E SEMANA</h4></div>
              <div className="w-full flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-zinc-200 pr-1 scrollbar-thin print:max-h-none print:overflow-visible">
                <table className="w-full text-left text-xs border-collapse min-w-[380px]">
                  <thead className="sticky top-0 z-30">
                    <tr className="bg-[#EE4D2D] text-white border-b border-[#EE4D2D]">
                      <th className="p-2 text-left bg-[#EE4D2D] font-bold text-[10px] tracking-wider sticky left-0 z-40 min-w-[120px] border-r border-white/10">ANALISTA</th>
                      <th className="p-2 font-bold text-[10px] tracking-wider text-center min-w-[80px] bg-[#EE4D2D]">TOTAL</th>
                      {colunasSemanasUnicas.map((semanaNome, i) => (<th key={i} className="p-2 text-center font-bold text-[10px] tracking-wider min-w-[65px] bg-[#EE4D2D]">{semanaNome.toUpperCase()}</th>))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 text-[11px] text-zinc-700">
                    {Object.keys(matrizAnalistaSemana).length > 0 ? (
                      Object.keys(matrizAnalistaSemana).sort((a, b) => { const tA = Object.values(matrizAnalistaSemana[a]).reduce((acc, val) => acc + val, 0); const tB = Object.values(matrizAnalistaSemana[b]).reduce((acc, val) => acc + val, 0); return tB - tA; }).map((anaKey, idx) => {
                        const totalAna = Object.values(matrizAnalistaSemana[anaKey]).reduce((a, b) => a + b, 0) || 0;
                        const pctAna = totalLeads > 0 ? (totalAna / totalLeads) * 100 : 0;
                        return (
                          <tr key={idx} className="hover:bg-zinc-50 transition-colors">
                            <td className="p-2 font-semibold bg-white/95 text-zinc-900 sticky left-0 z-20 border-r border-zinc-200 truncate" title={anaKey}>{anaKey}</td>
                            <td className="p-2 text-center font-bold font-mono bg-zinc-500/5 text-[#EE4D2D]">{totalAna} <span className="text-zinc-400 text-[10px] font-normal">({pctAna.toFixed(0)}%)</span></td>
                            {colunasSemanasUnicas.map((semanaNome, i) => {
                              const val = matrizAnalistaSemana[anaKey][semanaNome] || 0;
                              const pct = totalAna > 0 ? (val / totalAna) * 100 : 0;
                              return (<td key={i} className="p-2 text-center font-mono text-zinc-700">{val > 0 ? (<span><span className="font-bold">{val}</span><span className="text-zinc-400 text-[9px] ml-0.5">({pct.toFixed(0)}%)</span></span>) : (<span className="text-zinc-300">-</span>)}</td>);
                            })}
                          </tr>
                        );
                      })
                    ) : (<tr><td colSpan={colunasSemanasUnicas.length + 2} className="p-4 text-center text-zinc-400 italic">Sem registros.</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PAINEL GERENCIAL — ATENDIMENTOS DD.40                           */}
        {/* ================================================================ */}

        <div className="space-y-5 pt-3">
          <div className="flex items-center gap-3 border-b-2 border-[#EE4D2D] pb-3">
            <div className="p-2 rounded-lg bg-[#EE4D2D]/10"><Gauge className="w-5 h-5 text-[#EE4D2D]" /></div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black uppercase tracking-wider text-[#EE4D2D]">Painel Gerencial — Atendimentos</h2>
              <p className="text-[11px] text-slate-500 font-medium">Dados atualizados automaticamente da aba "Atendimentos DD.40"</p>
            </div>
          </div>

          {/* 1. SCORECARD EXECUTIVO */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Atendimentos", valor: atendGerais?.totalAtendimentos || "—", icon: <Users className="w-5 h-5" />, cor: "text-[#EE4D2D]", bg: "bg-[#EE4D2D]/5 border-[#EE4D2D]/20" },
              { label: "Media Atend/Dia", valor: atendGerais?.mediaAtendDia || "—", icon: <TrendingUp className="w-5 h-5" />, cor: "text-blue-600", bg: "bg-blue-500/5 border-blue-500/20" },
              { label: "Media/Dia/Analista", valor: atendGerais?.mediaDiaAnalista || "—", icon: <UserCheck className="w-5 h-5" />, cor: "text-emerald-600", bg: "bg-emerald-500/5 border-emerald-500/20" },
              { label: "Total Dias Uteis", valor: atendGerais?.totalDiasUteis || "—", icon: <Calendar className="w-5 h-5" />, cor: "text-purple-600", bg: "bg-purple-500/5 border-purple-500/20" },
            ].map((kpi, i) => (
              <div key={i} className={`p-4 rounded-2xl border text-center ${estilo.card} ${kpi.bg}`}>
                <div className={`mx-auto mb-2 ${kpi.cor}`}>{kpi.icon}</div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">{kpi.label}</p>
                <p className={`text-2xl lg:text-3xl font-black ${kpi.cor}`}>{kpi.valor}</p>
              </div>
            ))}
          </div>

          {/* 2. SLA + TMR + SCORECARD — LANDSCAPE: 3 colunas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gauge de Eficiencia */}
            <div className={`p-4 rounded-2xl border flex flex-col items-center justify-center ${estilo.card}`}>
              <div className="flex items-center gap-2 mb-3">
                <Gauge className="w-5 h-5 text-[#EE4D2D]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-[#EE4D2D]">SLA — Eficiencia Operacional</h4>
              </div>
              {(() => {
                const pctEficiencia = extrairPctEficiencia(atendGerais?.tempoEfetivoDia || '');
                const raio = 55;
                const circum = 2 * Math.PI * raio;
                const preenchido = (pctEficiencia / 100) * circum;
                return (
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 130 130">
                      <circle cx="65" cy="65" r={raio} fill="transparent" stroke="#e5e7eb" strokeWidth="11" />
                      <circle cx="65" cy="65" r={raio} fill="transparent" stroke={pctEficiencia >= 50 ? "#10b981" : pctEficiencia >= 30 ? "#f59e0b" : "#ef4444"} strokeWidth="11" strokeDasharray={`${preenchido} ${circum}`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xl font-black" style={{ color: pctEficiencia >= 50 ? '#059669' : pctEficiencia >= 30 ? '#d97706' : '#dc2626' }}>{pctEficiencia.toFixed(1)}%</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase">Eficiencia</span>
                    </div>
                  </div>
                );
              })()}
              <p className="text-[11px] text-slate-500 mt-2 text-center font-medium">{atendGerais?.tempoEfetivoDia || "—"}</p>
            </div>

            {/* TMR */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-center ${estilo.card}`}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-700">Tempo Medio de Resposta</h4>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                  <span className="text-xs font-bold text-slate-600">Med/Hora/Analista</span>
                  <span className="text-lg font-black text-blue-600">{atendGerais?.mediaHoraAnalista || "—"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                  <span className="text-xs font-bold text-slate-600">Med/Dia/Analista</span>
                  <span className="text-lg font-black text-emerald-600">{atendGerais?.mediaDiaAnalista || "—"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-orange-500/5 border border-orange-500/10">
                  <span className="text-xs font-bold text-slate-600">Total Analistas</span>
                  <span className="text-lg font-black text-orange-600">{atendGerais?.totalAnalistas || "—"}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/10">
                  <span className="text-xs font-bold text-slate-600">Total Semanas</span>
                  <span className="text-lg font-black text-purple-600">{atendGerais?.totalSemanas || "—"}</span>
                </div>
              </div>
            </div>

            {/* Scorecard Resumo */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-center ${estilo.card}`}>
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-amber-500" />
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-600">Scorecard Executivo</h4>
              </div>
              <div className="space-y-2.5">
                {rankingAnalistasSheet.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                    <p className="text-[10px] font-bold uppercase text-amber-700 mb-0.5">Top 1 Analista</p>
                    <p className="text-base font-black text-slate-800">{rankingAnalistasSheet[0]?.nome}</p>
                    <p className="text-[11px] text-slate-500">{rankingAnalistasSheet[0]?.totalAtend} atend. | {rankingAnalistasSheet[0]?.atendDia}/dia | {rankingAnalistasSheet[0]?.tempoEfetivo}</p>
                  </div>
                )}
                {rankingHubsSheet.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/10">
                    <p className="text-[10px] font-bold uppercase text-blue-700 mb-0.5">Top 1 HUB</p>
                    <p className="text-base font-black text-slate-800">{rankingHubsSheet[0]?.hub}</p>
                    <p className="text-[11px] text-slate-500">{rankingHubsSheet[0]?.totalAtend} atend. | {rankingHubsSheet[0]?.pctTotal}</p>
                  </div>
                )}
                {detalheSemanas.length > 0 && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] font-bold uppercase text-emerald-700 mb-0.5">Semana Pico</p>
                    {(() => {
                      const pico = [...detalheSemanas].sort((a, b) => {
                        const na = Number(String(a.numAtend || '0').replace(/\./g, '').replace(',', '.'));
                        const nb = Number(String(b.numAtend || '0').replace(/\./g, '').replace(',', '.'));
                        return nb - na;
                      })[0];
                      return pico ? (<><p className="text-base font-black text-slate-800">{pico.semana}</p><p className="text-[11px] text-slate-500">{pico.numAtend} atend. | {pico.pctTotal} | {pico.analise}</p></>) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. RANKING ANALISTAS */}
          <div className={`p-4 rounded-2xl border ${estilo.card}`}>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="w-5 h-5 text-[#EE4D2D]" />
              <h4 className="text-sm font-black uppercase tracking-wider text-[#EE4D2D]">Produtividade por Analista — Atendimentos DD.40</h4>
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-[#EE4D2D] text-white">
                    <th className="p-2 text-left font-bold text-[10px] tracking-wider">#</th>
                    <th className="p-2 text-left font-bold text-[10px] tracking-wider">ANALISTA</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">TOTAL ATEND.</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">ATEND/DIA</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">% TOTAL</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">STATUS</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">TEMPO EFETIVO/DIA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {rankingAnalistasSheet.length > 0 ? rankingAnalistasSheet.map((a: any, i: number) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-2 font-black text-slate-700">{a.posicao}</td>
                      <td className="p-2 font-bold text-slate-800">{a.nome}</td>
                      <td className="p-2 text-center font-black text-[#EE4D2D]">{a.totalAtend}</td>
                      <td className="p-2 text-center font-bold text-blue-600">{a.atendDia}</td>
                      <td className="p-2 text-center font-mono text-slate-600">{a.pctTotal}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${String(a.status).includes('ACIMA') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{a.status}</span>
                      </td>
                      <td className="p-2 text-center font-mono font-bold text-purple-600">{a.tempoEfetivo}</td>
                    </tr>
                  )) : (<tr><td colSpan={7} className="p-4 text-center text-zinc-400 italic">Aguardando dados da planilha...</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. EVOLUCAO SEMANAL ATENDIMENTOS */}
          <div className={`p-4 rounded-2xl border ${estilo.card}`}>
            <div className="flex items-center gap-2 mb-3 justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-black uppercase tracking-wider text-blue-700">Evolucao Semanal de Atendimentos — Gap vs Media</h4>
            </div>
            <div className="w-full overflow-x-auto pb-4">
              <div className="flex items-end justify-center gap-3 sm:gap-4 min-w-max px-4" style={{ height: '260px' }}>
                {detalheSemanas.length > 0 ? (
                  [...detalheSemanas].reverse().map((sem: any, idx: number) => {
                    const numAtend = Number(String(sem.numAtend || '0').replace(/\./g, '').replace(',', '.'));
                    const maxAtend = Math.max(...detalheSemanas.map((s: any) => Number(String(s.numAtend || '0').replace(/\./g, '').replace(',', '.'))));
                    const alturaPct = maxAtend > 0 ? (numAtend / maxAtend) * 100 : 0;
                    const isAcima = String(sem.status || '').includes('ACIMA');
                    return (
                      <div key={idx} className="flex flex-col items-center w-12 sm:w-14 justify-end group">
                        <div className="mb-1 text-center flex flex-col items-center h-12 justify-end shrink-0">
                          <span className="text-[12px] font-black text-slate-800 whitespace-nowrap">{sem.numAtend}</span>
                          <span className={`text-[9px] font-bold ${isAcima ? 'text-emerald-600' : 'text-red-500'}`}>{sem.gap}</span>
                          <span className="text-[8px] text-slate-400">{sem.pctTotal}</span>
                        </div>
                        <div className="w-6 sm:w-7 rounded-full overflow-hidden relative shrink-0 shadow-inner bg-slate-200" style={{ height: '160px' }}>
                          <div className={`w-full rounded-full absolute bottom-0 left-0 transition-all duration-500 ${isAcima ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-500 to-red-400'}`} style={{ height: `${Math.max(10, alturaPct)}%` }} />
                        </div>
                        <div className="mt-1.5 text-center shrink-0">
                          <span className="text-[9px] font-black text-slate-500 whitespace-nowrap">{sem.semana.replace('Week-', 'W')}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (<div className="flex items-center justify-center w-full py-8"><p className="text-xs text-zinc-500 italic">Aguardando dados da planilha...</p></div>)}
              </div>
            </div>
          </div>

          {/* 5. RANKING HUB */}
          <div className={`p-4 rounded-2xl border ${estilo.card}`}>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h4 className="text-sm font-black uppercase tracking-wider text-blue-700">Ranking de Eficiencia por HUB — Atendimentos DD.40</h4>
            </div>
            <div className="overflow-x-auto rounded-xl border border-zinc-200 max-h-[380px] overflow-y-auto">
              <table className="w-full text-xs border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-[#EE4D2D] text-white">
                    <th className="p-2 text-left font-bold text-[10px] tracking-wider">#</th>
                    <th className="p-2 text-left font-bold text-[10px] tracking-wider">HUB</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">TOTAL ATEND.</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">% TOTAL</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">STATUS</th>
                    <th className="p-2 text-center font-bold text-[10px] tracking-wider">ANALISE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {rankingHubsSheet.length > 0 ? rankingHubsSheet.map((h: any, i: number) => (
                    <tr key={i} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-2 font-black text-slate-700">{h.posicao}</td>
                      <td className="p-2 font-bold text-slate-800">{h.hub}</td>
                      <td className="p-2 text-center font-black text-[#EE4D2D]">{h.totalAtend}</td>
                      <td className="p-2 text-center font-mono text-slate-600">{h.pctTotal}</td>
                      <td className="p-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${String(h.status).includes('ACIMA') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{h.status}</span>
                      </td>
                      <td className="p-2 text-center text-[11px] text-slate-500 italic">{h.analise}</td>
                    </tr>
                  )) : (<tr><td colSpan={6} className="p-4 text-center text-zinc-400 italic">Aguardando dados da planilha...</td></tr>)}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. VISAO GERAL PRODUTIVIDADE */}
          <div className={`p-4 rounded-2xl border ${estilo.card}`}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-wider text-amber-600">Visao Geral de Produtividade</h4>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#EE4D2D]/5 to-orange-100/30 border border-[#EE4D2D]/10">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#EE4D2D] mb-1">Total Atendimentos</p>
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{atendGerais?.totalAtendimentos || "—"}</p>
                <p className="text-[10px] text-slate-500 mt-1">Em {atendGerais?.totalDiasUteis || "—"} dias uteis</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-100/30 border border-blue-500/10">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 mb-1">Atendimentos / Dia (equipe)</p>
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{atendGerais?.mediaAtendDia || "—"}</p>
                <p className="text-[10px] text-slate-500 mt-1">Com {atendGerais?.totalAnalistas || "—"} analistas</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/5 to-emerald-100/30 border border-emerald-500/10">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 mb-1">Atend/Hora/Analista</p>
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{atendGerais?.mediaHoraAnalista || "—"}</p>
                <p className="text-[10px] text-slate-500 mt-1">~1 atendimento a cada {atendGerais?.mediaHoraAnalista || "—"}min</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/5 to-purple-100/30 border border-purple-500/10">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 mb-1">Periodo Analizado</p>
                <p className="text-2xl lg:text-3xl font-black text-slate-800">{atendGerais?.totalSemanas || "—"} <span className="text-base">sem.</span></p>
                <p className="text-[10px] text-slate-500 mt-1">{atendGerais?.totalDiasUteis || "—"} dias uteis operacionais</p>
              </div>
            </div>
          </div>

        </div>
        {/* FIM DO PAINEL GERENCIAL */}

      </div>
    </div>
  );
}
