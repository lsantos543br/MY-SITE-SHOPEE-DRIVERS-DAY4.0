'use client';  
  
import React, { useState, useEffect, useRef } from 'react';  
import {  
  Users, Calendar, CheckCircle, BarChart3, TrendingUp,  
  Target, FilterX, ChevronDown, Check,  
  Activity, Download  
} from 'lucide-react';  
  
interface DashboardProps {  
  listaFiltradaDash: any[];  
  modaisPagina2: { name: string; qtd: number; pct: number }[];  
  classesTema: { card: string; input: string; textTitle: string };  
  disparosRealizados?: number;  
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
  
  // Alterado para false para iniciar no tema claro por padrão  
  const [temaEscuro, setTemaEscuro] = useState(false);  
  
  // ==========================================  
  // 🙈 ANALISTAS OCULTOS  
  // ==========================================  
  const nomesAnalistasOcultos = ['barbara targino'];  
  const normalizarNomeAnalista = (nome: any) => String(nome || '').trim().toLowerCase();  
  const analistaEstaOculto = (nome: any) => nomesAnalistasOcultos.includes(normalizarNomeAnalista(nome));  
  const opcoesAnalistasVisiveis = opcoesAnalistas.filter(a => !analistaEstaOculto(a));  
  
  // ==========================================  
  // ⚙️ TRATAMENTO DOS ARRAYS SELECIONADOS  
  // ==========================================  
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
  
  // ==========================================  
  // 📊 FILTRAGEM ACUMULATIVA  
  // ==========================================  
  const dadosEfetivos = listaFiltradaDash.filter(m => {  
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
  });  
  
  const totalLeads = dadosEfetivos.length;  
  
  // ==========================================  
  // 📈 CÁLCULO DOS CARDS PRINCIPAIS  
  // ==========================================  
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
  
  const taxaComparecimento =  
    (totalCompareceram + totalNaoCompareceram) > 0  
      ? (totalCompareceram / (totalCompareceram + totalNaoCompareceram)) * 100  
      : 0;  
  
  const taxaMetaFirstTrip =  
    totalTreinamentosCustomizado > 0  
      ? (totalFirstTrip / totalTreinamentosCustomizado) * 100  
      : 0;  
  
  const taxaDriversAtendimentos =  
    totalLeads > 0  
      ? (totalTreinamentosCustomizado / totalLeads) * 100  
      : 0;  
  
  const pctTotalLeads = totalLeads > 0 ? 100 : 0;  
  
  const pctTreinamentosAgendados =  
    totalLeads > 0  
      ? (totalTreinamentosAgendados / totalLeads) * 100  
      : 0;  
  
  const pctFirstTripSobreCompareceram =  
    totalCompareceram > 0  
      ? (totalFirstTrip / totalCompareceram) * 100  
      : 0;  
  
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
  
  // Evolução Semanal recalculada dinamicamente  
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
  
  // ==========================================  
  // ✨ PERFORMANCE DOS ANALISTAS  
  // ==========================================  
  const rankingConversao = opcoesAnalistasVisiveis  
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
    .sort((a, b) => b.taxaNum - a.taxaNum);  
  
  const rankingAtendimentos = opcoesAnalistasVisiveis  
    .filter(a => a && a !== "TODOS")  
    .map(analista => {  
      const totalAtendimentos = dadosEfetivos.filter(m => {  
        const nome = String(m.analyst || m.analista || m.Analyst || m.Analista || '').trim().toLowerCase();  
        return nome === analista.toLowerCase();  
      }).length;  
  
      const shareVolStr = totalLeads > 0 ? ((totalAtendimentos / totalLeads) * 100).toFixed(1) : "0.0";  
      return { nome: analista, totalAtendimentos, shareVolStr };  
    })  
    .sort((a, b) => b.totalAtendimentos - a.totalAtendimentos);  
  
  // =================================================================  
  // 🔄 PROCESSAMENTO EXCLUSIVO E MAPEAMENTO CRUZA COMPLETO  
  // =================================================================  
  const contagemStatusGlobais: { [key: string]: number } = {};  
  const cruzamentoStatusSemana: { [status: string]: { [semana: string]: number } } = {};  
  const matrizHubSemana: { [hub: string]: { [semana: string]: number } } = {};  
  const matrizAnalistaSemana: { [analista: string]: { [semana: string]: number } } = {};  
  
  // NOVAS VARIÁVEIS PARA MODAL  
  const contagemModaisGlobais: { [key: string]: number } = {};  
  const cruzamentoModalSemana: { [modal: string]: { [semana: string]: number } } = {};  
  
  dadosEfetivos.forEach(m => {  
    let stRaw = String(m.status || m.Status || 'Sem Status').trim();  
    if (!stRaw) stRaw = 'Sem Status';  
    contagemStatusGlobais[stRaw] = (contagemStatusGlobais[stRaw] || 0) + 1;  
  
    const hb = String(m.hub || m.Hub || m.filial || m.Filial || 'Outros').trim();  
    const sem = String(m.weekend || m.semana || m.Weekend || m.Semana || 'Sem Semana').trim();  
    const ana = String(m.analyst || m.analista || m.Analyst || m.Analista || 'Sem Analista').trim();  
  
    // Popular dados de Modal  
    let modalRaw = String(m.modal || m.Modal || 'Sem Modal').trim();  
    if (!modalRaw) modalRaw = 'Sem Modal';  
    contagemModaisGlobais[modalRaw] = (contagemModaisGlobais[modalRaw] || 0) + 1;  
  
    if (!cruzamentoStatusSemana[stRaw]) cruzamentoStatusSemana[stRaw] = {};  
    cruzamentoStatusSemana[stRaw][sem] = (cruzamentoStatusSemana[stRaw][sem] || 0) + 1;  
  
    if (!matrizHubSemana[hb]) matrizHubSemana[hb] = {};  
    matrizHubSemana[hb][sem] = (matrizHubSemana[hb][sem] || 0) + 1;  
  
    if (!analistaEstaOculto(ana)) {  
      if (!matrizAnalistaSemana[ana]) matrizAnalistaSemana[ana] = {};  
      matrizAnalistaSemana[ana][sem] = (matrizAnalistaSemana[ana][sem] || 0) + 1;  
    }  
  
    // Popular cruzamento Modal x Semana  
    if (!cruzamentoModalSemana[modalRaw]) cruzamentoModalSemana[modalRaw] = {};  
    cruzamentoModalSemana[modalRaw][sem] = (cruzamentoModalSemana[modalRaw][sem] || 0) + 1;  
  });  
  
  const listaTodosStatusEncontrados = Object.keys(contagemStatusGlobais).sort(  
    (a, b) => contagemStatusGlobais[b] - contagemStatusGlobais[a]  
  );  
  
  // Lista de todos os Modais encontrados, ordenada por quantidade  
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
    fundo: temaEscuro ? 'bg-zinc-950 text-white' : 'bg-slate-50 text-slate-900',  
    card: temaEscuro ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-white border-slate-200 shadow-sm',  
    filtroContainer: temaEscuro ? 'bg-zinc-900/20 border-zinc-800/40' : 'bg-slate-100 border-slate-200/80',  
    selectDropdown: temaEscuro ? 'bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50',  
    menuFlutuante: temaEscuro ? 'bg-zinc-900 border-zinc-700 shadow-2xl text-white' : 'bg-white border-slate-200 shadow-xl text-slate-800',  
    itemHover: temaEscuro ? 'hover:bg-zinc-800 text-zinc-300' : 'hover:bg-slate-100 text-slate-700',  
    textoSecundario: temaEscuro ? 'text-zinc-400' : 'text-slate-600',  
    textoLabels: temaEscuro ? 'text-zinc-500' : 'text-slate-400',  
    barraFundo: temaEscuro ? 'bg-zinc-950' : 'bg-slate-200',  
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
  
      if (opcao === "TODOS") {  
        onMudar("TODOS");  
        return;  
      }  
  
      let novosFlegados = [...flegadosAtuais];  
      const index = novosFlegados.findIndex(x => x.toLowerCase() === opcao.toLowerCase());  
  
      if (index > -1) {  
        novosFlegados.splice(index, 1);  
      } else {  
        novosFlegados.push(opcao);  
      }  
  
      if (novosFlegados.length === 0) {  
        onMudar("TODOS");  
      } else {  
        onMudar(novosFlegados.join(', '));  
      }  
    };  
  
    return (  
      <div ref={refContainer} className="space-y-1 relative w-full">  
        <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${estilo.textoLabels}`}>  
          {label}  
        </label>  
  
        <button  
          type="button"  
          onClick={() => setAberto(!aberto)}  
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
  
  return (  
    <div className={`p-6 rounded-3xl min-h-screen transition-colors duration-300 ${estilo.fundo}`}>  
  
      {/* CABEÇALHO DO DASHBOARD COM BOTÃO PDF (Invisível na impressão) */}  
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 print:hidden">  
        <h1 className="text-2xl font-black uppercase tracking-wider text-[#1d4ed8] flex items-center gap-2">  
          <Activity className="w-5 h-5" /> Dashboard drivers day  
        </h1>  
        <button  
          onClick={() => window.print()}  
          className="flex items-center gap-2 bg-[#EE4D2D] hover:bg-[#d44022] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm"  
        >  
          <Download className="w-4 h-4" /> Baixar em PDF  
        </button>  
      </div>  
  
      <div className="space-y-6">  
        {/* FILTROS (Invisível na impressão) */}  
        <div className={`border p-4 rounded-2xl flex flex-col gap-4 print:hidden ${estilo.filtroContainer}`}>  
          <div className="flex items-center justify-between">  
            <p className={`text-[18px] font-black tracking-wider uppercase flex items-center gap-1.5 text-[#EE4D2D]`}>  
              <span className="w-2 h-2 rounded-full bg-orange-500" />  
              Painel Geral de Filtros  
            </p>  
  
            {temFiltroAtivo && (  
              <button  
                onClick={limparTodosOsFiltros}  
                className="text-xs font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors"  
              >  
                <FilterX className="w-3.5 h-3.5" /> Limpar Filtros  
              </button>  
            )}  
          </div>  
  
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">  
            <MultiSelectFiltro label="Filtrar por HUB" opcoes={opcoesHubs} valorString={filtroHub} onMudar={setFiltroHub} />  
            <MultiSelectFiltro label="Filtrar por Veículo" opcoes={opcoesModais} valorString={filtroModal} onMudar={setFiltroModal} />  
            <MultiSelectFiltro label="Filtrar por Semana" opcoes={opcoesSemanas} valorString={filtroSemana} onMudar={setFiltroSemana} />  
            <MultiSelectFiltro label="Filtrar por Analista" opcoes={opcoesAnalistasVisiveis} valorString={filtroAnalista} onMudar={setFiltroAnalista} />  
          </div>  
        </div>  
  
        {/* INDICADORES ABSOLUTOS - PRIMEIRA LINHA */}  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">  
  
          {/* CARD 1: DISPAROS REALIZADOS */}  
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${estilo.card}`}>  
            <div className="p-3 rounded-xl bg-zinc-500/10 text-zinc-500">  
              <Activity className="w-5 h-5" />  
            </div>  
  
            <div>  
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#18181b] dark:text-blue-700">  
                TOTAL APROXIMADO DE DISPAROS REALIZADOS      
                (TODAS AS LINHAS DAS BASES 7 DD4-SPM E SPC SOMADAS)  
              </p>  
  
              <h3 className="text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">  
                <span className="text-black dark:text-black">  
                  {Number(disparosRealizados || 0).toLocaleString("pt-BR")}  
                </span>  
              </h3>  
            </div>  
          </div>  
  
          {/* CARD 2: TOTAL DE LEADS QUE RESPONDERAM */}  
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${estilo.card}`}>  
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">  
              <Users className="w-5 h-5" />  
            </div>  
            <div>  
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#18181b] dark:text-blue-700">  
                Total de Leads que Responderam ao disparo  
              </p>  
              <h3 className="text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">  
                <span className="text-black dark:text-black">{totalLeads}</span>  
                <span className="text-sm font-bold text-orange-500">/ {pctTotalLeads.toFixed(1)}%</span>  
              </h3>  
            </div>  
          </div>  
  
          {/* CARD 3: TOTAL DE TREINAMENTOS AGENDADOS */}  
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${estilo.card}`}>  
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">  
              <Activity className="w-5 h-5" />  
            </div>  
            <div>  
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#0046B5] dark:text-blue-700">  
                Total de TREINAMENTOS AGENDADOS  
              </p>  
              <h3 className="text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">  
                <span className="text-black dark:text-black">  
                  {dadosEfetivos.filter(m => {  
                    const st = String(m.status || m.Status || '').trim().toLowerCase();  
                    return (  
                      st === "ag. integração/treinamento" ||  
                      st === "ag. integracao/treinamento" ||  
                      st === "não compareceu" ||  
                      st === "nao compareceu" ||  
                      st === "sem vagas hub" ||  
                      st === "ag. first trip" ||  
                      st === "first trip em atraso" ||  
                      st === "first trip efetuada" ||  
                      st === "efetuada" ||  
                      st === ""  
                    );  
                  }).length}  
                </span>  
                <span className="text-sm font-bold text-purple-600 dark:text-purple-400">  
                  / {totalLeads > 0  
                    ? ((dadosEfetivos.filter(m => {  
                      const st = String(m.status || m.Status || '').trim().toLowerCase();  
                      return (  
                        st === "ag. integração/treinamento" ||  
                        st === "ag. integracao/treinamento" ||  
                        st === "não compareceu" ||  
                        st === "nao compareceu" ||  
                        st === "ag. first trip" ||  
                        st === "first trip em atraso" ||  
                        st === "sem vagas hub" ||  
                        st === "first trip efetuada" ||  
                        st === "efetuada" ||  
                        st === ""  
                      );  
                    }).length / totalLeads) * 100).toFixed(1)  
                    : "0.0"}%  
                </span>  
              </h3>  
            </div>  
          </div>  
        </div>  
  
        {/* INDICADORES ABSOLUTOS - SEGUNDA LINHA */}  
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">  
  
          {/* CARD 4 */}  
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${estilo.card}`}>  
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">  
              <Calendar className="w-5 h-5" />  
            </div>  
            <div>  
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#0046B5] dark:text-blue-700">  
                Total LEADS QUE COMPARECERAM AO TREINAMENTO  
              </p>  
              <h3 className="text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">  
                <span className="text-black dark:text-black">  
                  {dadosEfetivos.filter(m => {  
                    const st = String(m.status || m.Status || '').trim().toLowerCase();  
                    return (  
                      st === "first trip efetuada" ||  
                      st === "efetuada" ||  
                      st === "ag. first trip" ||  
                      st === "first trip em atraso" ||  
                      st === "atraso" ||  
                      st === ""  
                    );  
                  }).length}  
                </span>  
                <span className="text-sm font-bold text-blue-500">  
                  / {(() => {  
                    const totalAgendados = dadosEfetivos.filter(m => {  
                      const st = String(m.status || m.Status || '').trim().toLowerCase();  
                      return (  
                        st === "ag. integração/treinamento" ||  
                        st === "ag. integracao/treinamento" ||  
                        st === "não compareceu" ||  
                        st === "nao compareceu" ||  
                        st === "sem vagas hub" ||  
                        st === "ag. first trip" ||  
                        st === "first trip em atraso" ||  
                        st === "first trip efetuada" ||  
                        st === "efetuada" ||  
                        st === ""  
                      );  
                    }).length;  
  
                    const compareceram = dadosEfetivos.filter(m => {  
                      const st = String(m.status || m.Status || '').trim().toLowerCase();  
                      return (  
                        st === "first trip efetuada" ||  
                        st === "efetuada" ||  
                        st === "ag. first trip" ||  
                        st === "first trip em atraso" ||  
                        st === "atraso" ||  
                        st === ""  
                      );  
                    }).length;  
  
                    return totalAgendados > 0 ? ((compareceram / totalAgendados) * 100).toFixed(1) : "0.0";  
                  })()}%  
                </span>  
              </h3>  
            </div>  
          </div>  
  
          {/* CARD 5 */}  
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${estilo.card}`}>  
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">  
              <CheckCircle className="w-5 h-5" />  
            </div>  
            <div>  
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#0046B5] dark:text-blue-700">  
                Total First Trip Efetuada / (% conversão com base no total de disparos respondidos)  
              </p>  
              <h3 className="text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">  
                <span>{totalFirstTrip}</span>  
                <span className="text-2xl font-bold text-emerald-500">  
                  / {totalLeads > 0 ? ((totalFirstTrip / totalLeads) * 100).toFixed(1) : "0.0"}%  
                </span>  
              </h3>  
            </div>  
          </div>  
  
          {/* CARD 6 */}  
          <div className={`p-5 rounded-2xl border flex items-center gap-4 ${estilo.card}`}>  
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">  
              <FilterX className="w-5 h-5" />  
            </div>  
  
            <div>  
              <p className="text-[13px] font-bold uppercase tracking-wider text-[#D44125] dark:text-red-600">  
                MÉDIA ATENDIMENTOS POR DIA, POR ANALISTA  
              </p>  
  
              <h3 className="text-2xl font-black mt-0.5 tracking-tight flex items-baseline gap-2">  
                <span>  
                  {(() => {  
                    if (!Array.isArray(dadosEfetivos) || dadosEfetivos.length === 0) return "0,0";  
  
                    const TOTAL_ANALISTAS = 7;  
  
                    const normalizar = (txt: string | null | undefined) =>  
                      String(txt || "")  
                        .toLowerCase()  
                        .normalize("NFD")  
                        .replace(/[\u0300-\u036f]/g, "")  
                        .trim();  
  
                    const primeiroItem = dadosEfetivos[0] || {};  
                    const chaves = Object.keys(primeiroItem);  
  
                    const chaveData =  
                      chaves.find((k) =>  
                        [  
                          "data",  
                          "date",  
                          "dia",  
                          "created_at",  
                          "created at",  
                          "data atendimento",  
                          "data_atendimento",  
                          "dt_atendimento",  
                          "dt atendimento",  
                        ].includes(normalizar(k))  
                      ) ||  
                      chaves.find((k) => {  
                        const nk = normalizar(k);  
                        return (  
                          nk.includes("data") ||  
                          nk.includes("date") ||  
                          nk.includes("dia") ||  
                          nk.includes("created")  
                        );  
                      });  
  
                    const totalAtendimentos = dadosEfetivos.length;  
  
                    const semanasUnicas = chaveData  
                      ? [  
                        ...new Set(  
                          dadosEfetivos  
                            .map((m) => {  
                              const valor = m?.[chaveData];  
                              if (!valor) return "";  
  
                              const d = new Date(valor);  
                              if (isNaN(d.getTime())) return "";  
  
                              const inicioAno = new Date(d.getFullYear(), 0, 1);  
                              const diffDias = Math.floor(  
                                (d.getTime() - inicioAno.getTime()) / (1000 * 60 * 60 * 24)  
                              );  
                              const semana = Math.ceil((diffDias + inicioAno.getDay() + 1) / 7);  
  
                              return `${d.getFullYear()}-${semana}`;  
                            })  
                            .filter(Boolean)  
                        ),  
                      ].length  
                      : 0;  
  
                    const totalDias = semanasUnicas * 7;  
  
                    const media =  
                      totalDias > 0 && TOTAL_ANALISTAS > 0  
                        ? totalAtendimentos / totalDias / TOTAL_ANALISTAS  
                        : 0;  
  
                    return media.toFixed(1).replace(".", ",");  
                  })()}  
                </span>  
  
                <span className="text-sm font-bold text-blue-500">  
                  por dia / analista  
                </span>  
              </h3>  
            </div>  
          </div>  
        </div>  
  
        {/* METRICS PERCENTUAIS & PERFORMANCE POR ANALISTA */}  
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">  
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">  
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-[310px] print:h-auto ${estilo.card}`}>  
              <div className="w-full">  
                <div className="flex items-center gap-2 text-orange-500 mb-3">  
                  <Target className="w-6 h-6" />  
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5722]">  
                    TREINADOS X FRIST TRIP POR ANALISTA (CONVERSÃO - agendados / first trip)  
                  </h4>  
                </div>  
                <div className="divide-y divide-zinc-800/10 dark:divide-zinc-800/50 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin space-y-0.5 print:max-h-none print:overflow-visible">  
                  {rankingConversao.length > 0 ? (  
                    rankingConversao.map((analista, idx) => {  
                      const agendadosAnalista = dadosEfetivos.filter(m => {  
                        const nome = String(m.analyst || m.analista || m.Analyst || m.Analista || '').trim().toLowerCase();  
                        const st = String(m.status || m.Status || '').trim().toLowerCase();  
                        return nome === analista.nome.toLowerCase() && (  
                          st.includes('integra') ||  
                          st.includes('ag. first trip') ||  
                          st.includes('atraso') ||  
                          st.includes('nao compareceu') ||  
                          st.includes('não compareceu') ||  
                          st === "first trip efetuada" ||  
                          st.includes("first trip efetuada") ||  
                          st === "efetuada"  
                        );  
                      }).length;  
  
                      const novaTaxa = agendadosAnalista > 0  
                        ? ((analista.convertidos / agendadosAnalista) * 100).toFixed(1)  
                        : "0.0";  
  
                      return (  
                        <div key={analista.nome} className="flex justify-between items-center text-xs py-2.5 px-1 rounded-lg hover:bg-zinc-500/5 dark:hover:bg-zinc-900/20 transition-colors font-semibold">  
                          <span className={`truncate max-w-[150px] ${temaEscuro ? 'text-zinc-300' : 'text-slate-700'}`}>  
                            {idx + 1}. {analista.nome}  
                          </span>  
                          <div className="flex items-center gap-3 font-mono text-right">  
                            <span className={`text-[11px] font-medium ${estilo.textoSecundario}`}>  
                              {analista.convertidos}/{agendadosAnalista}  
                            </span>  
                            <span className="font-black text-orange-500 min-w-[45px]">{novaTaxa}%</span>  
                          </div>  
                        </div>  
                      );  
                    })  
                  ) : (  
                    <p className="text-xs italic text-zinc-500">Aguardando dados...</p>  
                  )}  
                </div>  
              </div>  
            </div>  
  
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-[310px] print:h-auto ${estilo.card}`}>  
              <div className="w-full">  
                <div className="flex items-center gap-2 text-orange-500 mb-3">  
                  <BarChart3 className="w-6 h-6" />  
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5722]">  
                    Atendimentos REALIZADOS por Analista  
                  </h4>  
                </div>  
                <div className="divide-y divide-zinc-800/10 dark:divide-zinc-800/50 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin space-y-0.5 print:max-h-none print:overflow-visible">  
                  {rankingAtendimentos.length > 0 ? (  
                    rankingAtendimentos.map((analista, idx) => (  
                      <div key={analista.nome} className="flex justify-between items-center text-xs py-2.5 px-1 rounded-lg hover:bg-zinc-500/5 dark:hover:bg-zinc-900/20 transition-colors font-semibold">  
                        <span className={`truncate max-w-[150px] ${temaEscuro ? 'text-zinc-300' : 'text-slate-700'}`}>  
                          {idx + 1}. {analista.nome}  
                        </span>  
                        <div className="flex items-center gap-2 font-mono text-right">  
                          <span className="text-zinc-500 text-[10px] hidden sm:inline">Vol. Absoluto</span>  
                          <span className="font-black text-blue-400 min-w-[55px]">  
                            {analista.totalAtendimentos}{' '}  
                            <span className="text-[10px] text-zinc-600 font-normal">({analista.shareVolStr}%)</span>  
                          </span>  
                        </div>  
                      </div>  
                    ))  
                  ) : (  
                    <p className="text-xs italic text-zinc-500">Aguardando dados...</p>  
                  )}  
                </div>  
              </div>  
            </div>  
          </div>  
  
          {/* CARD 3: RANKING DE FIRST TRIP EFETUADA POR ANALISTA */}  
          <div className={`p-5 rounded-2xl border flex flex-col justify-between h-[310px] print:h-auto ${estilo.card}`}>  
            <div className="w-full">  
              <div className="flex items-center gap-2 text-orange-500 mb-3">  
                <BarChart3 className="w-6 h-6 text-emerald-500" />  
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FF5722]">  
                  FIRST TRIP EFETUADA por Analista  
                </h4>  
              </div>  
              <div className="divide-y divide-zinc-800/10 dark:divide-zinc-800/50 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin space-y-0.5 print:max-h-none print:overflow-visible">  
                {(() => {  
                  const contagem: Record<string, number> = {};  
                  let totalGeralFT = 0;  
  
                  if (Array.isArray(dadosEfetivos)) {  
                    dadosEfetivos.forEach((m: any) => {  
                      const st = String(m?.status || m?.Status || '').trim().toLowerCase();  
                      if (st === "first trip efetuada" || st.includes("first trip efetuada") || st === "efetuada") {  
                        const nomeAnalista = String(m?.analyst || m?.analista || m?.Analyst || m?.Analista || 'Não Informado').trim();  
  
                        if (!analistaEstaOculto(nomeAnalista)) {  
                          contagem[nomeAnalista] = (contagem[nomeAnalista] || 0) + 1;  
                          totalGeralFT++;  
                        }  
                      }  
                    });  
                  }  
  
                  const listaRankeada = Object.entries(contagem)  
                    .map(([nome, total]) => ({  
                      nome,  
                      totalFirstTrip: total,  
                      shareStr: totalGeralFT > 0 ? ((total / totalGeralFT) * 100).toFixed(1) : "0.0"  
                    }))  
                    .sort((a, b) => b.totalFirstTrip - a.totalFirstTrip);  
  
                  if (listaRankeada.length > 0) {  
                    return listaRankeada.map((analista, idx) => (  
                      <div key={analista.nome} className="flex justify-between items-center text-xs py-2.5 px-1 rounded-lg hover:bg-zinc-500/5 dark:hover:bg-zinc-900/20 transition-colors font-semibold">  
                        <span className={`truncate max-w-[150px] ${temaEscuro ? 'text-zinc-300' : 'text-slate-700'}`}>  
                          {idx + 1}. {analista.nome}  
                        </span>  
                        <div className="flex items-center gap-2 font-mono text-right">  
                          <span className="text-zinc-500 text-[10px] hidden sm:inline">Vol. Absoluto</span>  
                          <span className="font-black text-emerald-400 min-w-[55px]">  
                            {analista.totalFirstTrip}{' '}  
                            <span className="text-[10px] text-zinc-600 font-normal">({analista.shareStr}%)</span>  
                          </span>  
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
  
        {/* FUNIL & EVOLUÇÃO */}  
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">  
  
{/* Card 1: Funil Operacional */}    
<div className={`p-5 rounded-3xl border h-[480px] lg:col-span-1 flex flex-col justify-between ${estilo.card}`}>    
  {(() => {    
    const tDisparos = Number(disparosRealizados || 0);  
    const tLeads = totalLeads || 0;    
  
    const tAgendados = dadosEfetivos.filter(m => {    
      const st = String(m.status || m.Status || '').trim().toLowerCase();    
      return (    
        st === "ag. integração/treinamento" ||    
        st === "ag. integracao/treinamento" ||    
        st === "não compareceu" ||    
        st === "nao compareceu" ||    
        st === "sem vagas hub" ||    
        st === "ag. first trip" ||    
        st === "first trip em atraso" ||    
        st === "first trip efetuada" ||    
        st === ""    
      );    
    }).length;    
  
    const tCompareceram = dadosEfetivos.filter(m => {    
      const st = String(m.status || m.Status || '').trim().toLowerCase();    
      return (    
        st === "first trip efetuada" ||    
        st === "efetuada" ||    
        st === "ag. first trip" ||    
        st === "first trip em atraso" ||    
        st === "atraso" ||    
        st === ""    
      );    
    }).length;    
  
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
      return {    
        x: (32 + 22 * Math.cos(anguloRad)).toFixed(1),    
        y: (32 + 22 * Math.sin(anguloRad)).toFixed(1)    
      };    
    };    
  
    const txtAgendados = obterCentroGomo(oAgendados, fAgendados);    
    const txtCompareceram = obterCentroGomo(oCompareceram, fCompareceram);    
    const txtFirstTrip = obterCentroGomo(oFirstTrip, fFirstTrip);    
  
    return (    
      <div className="space-y-4 flex-1 flex flex-col">    
        <div className="flex items-center gap-2 text-[#0046B5] dark:text-black-400">    
          <BarChart3 className="w-5 h-5" />    
          <h4 className="text-xs font-black uppercase tracking-wider">Funil Operacional</h4>    
        </div>    
  
        <div className="flex flex-col items-center justify-center flex-1 pt-2 gap-6">    
          <div className="relative w-48 h-48 flex items-center justify-center filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.12)]">    
            <svg className="w-full h-full" viewBox="0 0 64 64">    
              {tAgendados > 0 && (    
                <circle cx="32" cy="32" r="22" fill="transparent" stroke="#a855f7" strokeWidth="11"    
                  strokeDasharray={`${fAgendados} ${circumference}`} strokeDashoffset={`-${oAgendados}`}    
                  className="transform -rotate-90 origin-center" />    
              )}    
  
              {tCompareceram > 0 && (    
                <circle cx="32" cy="32" r="22" fill="transparent" stroke="#3b82f6" strokeWidth="11"    
                  strokeDasharray={`${fCompareceram} ${circumference}`} strokeDashoffset={`-${oCompareceram}`}    
                  className="transform -rotate-90 origin-center" />    
              )}    
  
              {tFirstTrip > 0 && (    
                <circle cx="32" cy="32" r="22" fill="transparent" stroke="#10b981" strokeWidth="11"    
                  strokeDasharray={`${fFirstTrip} ${circumference}`} strokeDashoffset={`-${oFirstTrip}`}    
                  className="transform -rotate-90 origin-center" />    
              )}    
  
              {tAgendados > 0 && fAgendados > 10 && (    
                <text x={txtAgendados.x} y={txtAgendados.y} fill="#ffffff" fontSize="3.5" fontWeight="900" textAnchor="middle" dominantBaseline="central" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">    
                  {tAgendados}    
                </text>    
              )}    
  
              {tCompareceram > 0 && fCompareceram > 10 && (    
                <text x={txtCompareceram.x} y={txtCompareceram.y} fill="#ffffff" fontSize="3.5" fontWeight="900" textAnchor="middle" dominantBaseline="central" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">    
                  {tCompareceram}    
                </text>    
              )}    
  
              {tFirstTrip > 0 && fFirstTrip > 10 && (    
                <text x={txtFirstTrip.x} y={txtFirstTrip.y} fill="#ffffff" fontSize="3.5" fontWeight="900" textAnchor="middle" dominantBaseline="central" className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">    
                  {tFirstTrip}    
                </text>    
              )}    
            </svg>    
  
            <div className="absolute w-20 h-20 rounded-full flex flex-col items-center justify-center bg-white dark:bg-zinc-950 shadow-md border border-zinc-500/10">    
              <span className="text-xl font-black text-[#0046B5] dark:text-blue-400">    
                {tLeads}    
              </span>    
              <p className="text-[8px] uppercase tracking-wider text-zinc-400 font-black">Total Leads</p>    
            </div>    
          </div>    
  
          <div className="w-full space-y-2.5">    
            <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1.5">    
              <div className="flex items-center gap-2">    
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-500 shrink-0" />    
                <span className={estilo.textoSecundario}>0 Total de Disparos</span>    
              </div>    
              <span className="font-black text-zinc-800 dark:text-black-200">  
                {tDisparos.toLocaleString("pt-BR")} un  
              </span>    
            </div>  
  
            <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1.5">    
              <div className="flex items-center gap-2">    
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0" />    
                <span className={estilo.textoSecundario}>1 Resposta Leads</span>    
              </div>    
              <span className="font-black text-black-800 dark:text-black-200">{tLeads} un</span>    
            </div>    
  
            <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1.5">    
              <div className="flex items-center gap-2">    
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />    
                <span className={estilo.textoSecundario}>2 Leads Agendados</span>    
              </div>    
              <span className="font-black text-zinc-800 dark:text-black-200">{tAgendados} un</span>    
            </div>    
  
            <div className="flex items-center justify-between text-xs font-bold border-b border-zinc-500/10 pb-1.5">    
              <div className="flex items-center gap-2">    
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />    
                <span className={estilo.textoSecundario}>3 Compareceram</span>    
              </div>    
              <span className="font-black text-zinc-800 dark:text-black-200">{tCompareceram} un</span>    
            </div>    
  
            <div className="flex items-center justify-between text-xs font-bold pb-0.5">    
              <div className="flex items-center gap-2">    
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />    
                <span className={estilo.textoSecundario}>4 First Trip Efetuada</span>    
              </div>    
              <span className="font-black text-zinc-800 dark:text-black-200">{tFirstTrip} un</span>    
            </div>    
          </div>    
        </div>    
      </div>    
    );    
  })()}    
</div>
  
          {/* 2: Evolução de Respostas por Semana */}  
          <div className={`p-5 rounded-2xl border h-full flex flex-col justify-between lg:col-span-3 ${estilo.card}`}>  
            <div className="space-y-8 flex-1 flex flex-col w-full">  
  
              <div className="flex items-center gap-2 justify-center w-full border-b pb-3 border-zinc-100 dark:border-zinc-1000">  
                <TrendingUp className="w-5 h-5 text-[#0046B5] dark:text-blue-400" />  
                <h4 className="text-l font-black uppercase tracking-wider text-[#0046B5] dark:text-black-400 text-center">  
                  Evolução de Respostas por Semana  
                </h4>  
              </div>  
  
              <div className="w-full overflow-x-auto pb-4 pt-4">  
                <div className="flex items-end justify-center gap-4 sm:gap-6 min-w-max px-4 h70">  
                  {semanasOrdenadas.length > 0 ? (  
                    [...semanasOrdenadas]  
                      .filter((sem) => {  
                        const nome = String(sem?.name || "").trim();  
                        const match = nome.match(/\d+/);  
                        const numeroSemana = match ? Number(match[0]) : null;  
                        if (!numeroSemana) return true;  
  
                        const hoje = new Date();  
                        const inicioAno = new Date(hoje.getFullYear(), 0, 1);  
                        const diffDias = Math.floor(  
                          (hoje.getTime() - inicioAno.getTime()) / (1000 * 60 * 60 * 24)  
                        );  
                        const semanaAtual = Math.ceil((diffDias + inicioAno.getDay() + 1) / 7);  
  
                        return numeroSemana <= semanaAtual;  
                      })  
                      .sort((a, b) => {  
                        const semanaA = Number(String(a?.name || "").match(/\d+/)?.[0] || 0);  
                        const semanaB = Number(String(b?.name || "").match(/\d+/)?.[0] || 0);  
                        return semanaB - semanaA;  
                      })  
                      .map((sem, idx) => {  
                        const porcentagem = totalLeads > 0 ? (sem.total / totalLeads) * 100 : 0;  
  
                        return (  
                          <div key={idx} className="flex flex-col items-center w-16 sm:w-20 justify-end group">  
                            <div className="mb-2 text-center flex flex-col items-center justify-end h-10 shrink-0">  
                              <span className="text-[15px] font-black text-black-1800 dark:text-black-100 whitespace-nowrap">  
                                {sem.total}  
                              </span>  
                              <span className="text-[13px] font-bold text-orange-400">  
                                {porcentagem.toFixed(1)}%  
                              </span>  
                            </div>  
  
                            <div className="w-8 sm:w-7.5 h-40 rounded-full bg-black-100 dark:bg-blue-300/50 overflow-hidden relative shrink-0 shadow-inner">  
                              <div  
                                className="bg-gradient-to-t from-orange-600 to-orange-500 w-full rounded-full absolute bottom-0 left-0 transition-all duration-500 group-hover:from-orange-500 group-hover:to-orange-400"  
                                style={{  
                                  height: `${totalLeads > 0 ? Math.max(18, Math.min(porcentagem * 5.35, 100)) : 18}%`  
                                }}  
                              />  
                            </div>  
  
                            <div className="mt-2.5 text-center shrink-0">  
                              <span className="text-[15px] font-black font-mono text-black-500 dark:text-black-400 whitespace-nowrap">  
                                {sem.name}  
                              </span>  
                            </div>  
                          </div>  
                        );  
                      })  
                  ) : (  
                    <div className="flex items-center justify-center h-full w-full py-8">  
                      <p className="text-xs text-zinc-500 italic text-center">Nenhuma semana localizada.</p>  
                    </div>  
                  )}  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
  
        {/* DISTRIBUIÇÃO MODAIS E HUBS */}  
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch w-full mt-6">  
  
          {/* Card 3: Respostas por Modal */}  
          <div className={`p-5 rounded-3xl border flex flex-col justify-between lg:col-span-1 ${estilo.card}`}>  
            <div className="space-y-10">  
              <h4 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 text-[#FF5722]">  
                📊 Respostas por Modal  
              </h4>  
              <div className="space-y-8">  
                {(() => {  
                  const modaisFiltrados = modaisPagina2.filter(modal => modal.qtd > 0);  
  
                  if (!modaisFiltrados || modaisFiltrados.length === 0) {  
                    return <p className="text-xs italic text-black-500">Nenhum modal encontrado.</p>;  
                  }  
  
                  const totalGeralModais = modaisFiltrados.reduce((acc, curr) => acc + (curr.qtd || 0), 0);  
  
                  const coresShopee = [  
                    "bg-[#FF5722]",  
                    "bg-[#FF7A45]",  
                    "bg-[#FFA366]",  
                    "bg-[#FFB88C]",  
                    "bg-zinc-500",  
                  ];  
  
                  const modaisOrdenados = [...modaisFiltrados].sort((a, b) => b.qtd - a.qtd);  
  
                  return modaisOrdenados.map((modal, i) => {  
                    const pctReal = totalGeralModais > 0 ? (modal.qtd / totalGeralModais) * 100 : 0;  
                    const corBarra = coresShopee[i % coresShopee.length];  
  
                    return (  
                      <div key={i} className="space-y-1">  
                        <div className="flex justify-between text-xs font-bold">  
                          <span className="uppercase text-[13px] text-black-800 dark:text-black-200">{modal.name}</span>  
                          <span className="text-blue-700 dark:text-blue-600">  
                            {modal.qtd} un <span className="text-[#FF5722]">({pctReal.toFixed(1)}%)</span>  
                          </span>  
                        </div>  
                        <div className={`w-full h-2 rounded-full overflow-hidden ${estilo.barraFundo}`}>  
                          <div className={`${corBarra} h-full rounded-full`} style={{ width: `${pctReal}%` }} />  
                        </div>  
                      </div>  
                    );  
                  });  
                })()}  
              </div>  
            </div>  
          </div>  
  
          {/* Card 4: Respostas por HUB */}  
          <div className={`p-5 rounded-3xl border flex flex-col justify-between lg:col-span-3 ${estilo.card}`}>  
            <div className="space-y-4 flex-1 flex flex-col justify-between h-full">  
              <h4 className="text-l font-black uppercase tracking-wider flex items-center justify-center gap-2 text-[#FF5722] text-center w-full">  
                📍 Respostas por HUB  
              </h4>  
  
              <div className="w-full overflow-x-auto pb-2 pt-4">  
                <div className="flex items-end justify-start sm:justify-center gap-4 sm:gap-6 min-w-max px-4 h-56">  
                  {hubsOrdenados && hubsOrdenados.length > 0 ? (  
                    hubsOrdenados.map((hub, i) => {  
                      return (  
                        <div key={i} className="flex flex-col items-center w-16 sm:w-20 justify-end group">  
  
                          <div className="mb-2 text-center flex flex-col items-center justify-end h-10 shrink-0">  
                            <span className="text-[15px] font-black text-black dark:text-black whitespace-nowrap">  
                              {hub.qtd}  
                            </span>  
                            <span className="text-[13px] font-bold text-orange-600 dark:text-orange-500">  
                              {hub.pct.toFixed(0)}%  
                            </span>  
                          </div>  
  
                          <div className={`w-8 sm:w-8 h-36 rounded-full overflow-hidden relative shrink-0 ${estilo.barraFundo} bg-zinc-100 dark:bg-zinc-60/50 shadow-inner`}>  
                            <div  
                              className="bg-gradient-to-t from-blue-600 to-blue-500 w-full rounded-full absolute bottom-0 left-0 transition-all duration-500 group-hover:from-blue-500 group-hover:to-blue-400"  
                              style={{ height: `${hub.pct > 0 ? Math.max(18, Math.min(hub.pct * .35, 100)) : 18}%` }}  
                            />  
                          </div>  
  
                          <div className="mt-2.5 text-center shrink-0 w-full max-w-[1000px] truncate">  
                            <span className="text-[13px] font-bold text-black-600 dark:text-black-800" title={hub.name}>  
                              {hub.name}  
                            </span>  
                          </div>  
  
                        </div>  
                      );  
                    })  
                  ) : (  
                    <div className="flex items-center justify-center h-full w-full py-8">  
                      <p className="text-xs text-zinc-500 italic text-center">Nenhum HUB localizado.</p>  
                    </div>  
                  )}  
                </div>  
              </div>  
            </div>  
          </div>  
        </div>  
  
        {/* TABELAS */}  
        <div className="space-y-4 pt-2">  
          <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200">  
            <Activity className="w-60 h-5 text-[#EE4D2D]" />  
            <h3 className="text-2xl font-bold text-[#0046B5] dark:text-blue-1000 uppercase tracking-wider">  
              Métricas Customizadas por Modal e Semana  
            </h3>  
          </div>  
  
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">  
            <div className={`p-4 rounded-2xl border flex flex-col h-[350px] print:h-auto ${estilo.card} border-zinc-200 dark:border-zinc-800`}>  
              <div className="mb-2">  
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-blue-700">  
                  RESPOSTAS LEADS POR MODAL E SEMANA  
                </h4>  
              </div>  
              <div className="w-full flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 pr-1 scrollbar-thin print:max-h-none print:overflow-visible">  
                <table className="w-full text-left text-xs border-collapse min-w-[380px]">  
                  <thead className="sticky top-0 z-30">  
                    <tr className="bg-[#EE4D2D] dark:bg-[#d44022] text-white border-b border-[#EE4D2D]">  
                      <th className="p-2 text-left bg-[#EE4D2D] dark:bg-[#d44022] font-bold text-[10px] tracking-wider sticky left-0 z-40 min-w-[140px] border-r border-white/10">MODAL</th>  
                      <th className="p-2 font-bold text-[10px] tracking-wider text-center min-w-[90px] bg-[#EE4D2D] dark:bg-[#d44022]">TOTAL</th>  
                      {colunasSemanasUnicas.map((semanaNome, i) => (  
                        <th key={i} className="p-2 text-center font-bold text-[10px] tracking-wider min-w-[75px] bg-[#EE4D2D] dark:bg-[#d44022]">{semanaNome.toUpperCase()}</th>  
                      ))}  
                    </tr>  
                  </thead>  
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">  
                    {listaTodosModaisEncontrados.length > 0 ? (  
                      listaTodosModaisEncontrados.map((modalNome, idx) => {  
                        const totalDoModal = contagemModaisGlobais[modalNome] || 0;  
                        const pctGeral = totalLeads > 0 ? (totalDoModal / totalLeads) * 100 : 0;  
  
                        return (  
                          <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">  
                            <td className="p-2 font-semibold flex items-center gap-1.5 truncate sticky left-0 bg-white/95 dark:bg-zinc-950/95 text-white-900 dark:text-white-700 z-20 border-r border-zinc-200 dark:border-zinc-800" title={modalNome}>  
                              <span className="truncate">{modalNome}</span>  
                            </td>  
                            <td className="p-2 text-center font-bold font-mono bg-zinc-500/5 text-[#EE4D2D]">  
                              {totalDoModal} <span className="text-zinc-400 dark:text-blue-500 text-[10px] font-normal">({pctGeral.toFixed(0)}%)</span>  
                            </td>  
                            {colunasSemanasUnicas.map((semanaNome, i) => {  
                              const qtdEspecifica = (cruzamentoModalSemana[modalNome] && cruzamentoModalSemana[modalNome][semanaNome]) || 0;  
                              const pctEspecifica = totalDoModal > 0 ? (qtdEspecifica / totalDoModal) * 100 : 0;  
  
                              return (  
                                <td key={i} className="p-2 text-center font-mono text-zinc-700 dark:text-black-300">  
                                  {qtdEspecifica > 0 ? (  
                                    <span>  
                                      <span className="font-bold">{qtdEspecifica}</span>  
                                      <span className="text-zinc-400 dark:text-zinc-500 text-[9px] ml-0.5">({pctEspecifica.toFixed(0)}%)</span>  
                                    </span>  
                                  ) : (  
                                    <span className="text-zinc-300 dark:text-zinc-700">-</span>  
                                  )}  
                                </td>  
                              );  
                            })}  
                          </tr>  
                        );  
                      })  
                    ) : (  
                      <tr>  
                        <td colSpan={colunasSemanasUnicas.length + 2} className="p-4 text-center text-zinc-400 italic">  
                          Sem registros.  
                        </td>  
                      </tr>  
                    )}  
                  </tbody>  
                </table>  
              </div>  
            </div>  
  
            <div className={`p-4 rounded-2xl border flex flex-col h-[350px] print:h-auto ${estilo.card} border-zinc-200 dark:border-zinc-800`}>  
              <div className="mb-2">  
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-blue-700">  
                  RESPOSTAS LEADS POR HUB E SEMANA  
                </h4>  
              </div>  
              <div className="w-full flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 pr-1 scrollbar-thin print:max-h-none print:overflow-visible">  
                <table className="w-full text-left text-xs border-collapse min-w-[380px]">  
                  <thead className="sticky top-0 z-30">  
                    <tr className="bg-[#EE4D2D] dark:bg-[#d44022] text-white border-b border-[#EE4D2D]">  
                      <th className="p-2 text-left bg-[#EE4D2D] dark:bg-[#d44022] font-bold text-[10px] tracking-wider sticky left-0 z-40 min-w-[140px] border-r border-white/10">HUB</th>  
                      <th className="p-2 font-bold text-[10px] tracking-wider text-center min-w-[90px] bg-[#EE4D2D] dark:bg-[#d44022]">TOTAL</th>  
                      {colunasSemanasUnicas.map((semanaNome, i) => (  
                        <th key={i} className="p-2 text-center font-bold text-[10px] tracking-wider min-w-[75px] bg-[#EE4D2D] dark:bg-[#d44022]">  
                          {semanaNome.toUpperCase()}  
                        </th>  
                      ))}  
                    </tr>  
                  </thead>  
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">  
                    {Object.keys(matrizHubSemana).length > 0 ? (  
                      Object.keys(matrizHubSemana)  
                        .sort((a, b) => {  
                          const totalA = Object.values(matrizHubSemana[a]).reduce((acc, val) => acc + val, 0);  
                          const totalB = Object.values(matrizHubSemana[b]).reduce((acc, val) => acc + val, 0);  
                          return totalB - totalA;  
                        })  
                        .map((hubKey, idx) => {  
                          const totalHubAcumulado = Object.values(matrizHubSemana[hubKey]).reduce((a, b) => a + b, 0) || 0;  
                          const pctHubGeral = totalLeads > 0 ? (totalHubAcumulado / totalLeads) * 100 : 0;  
  
                          return (  
                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">  
                              <td className="p-2 font-semibold bg-white/95 dark:bg-zinc-950/95 text-zinc-900 dark:text-zinc-100 sticky left-0 z-20 border-r border-zinc-200 dark:border-zinc-800 truncate" title={hubKey}>  
                                {hubKey}  
                              </td>  
                              <td className="p-2 text-center font-bold font-mono bg-zinc-500/5 text-[#EE4D2D]">  
                                {totalHubAcumulado} <span className="text-zinc-400 dark:text-blue-500 text-[10px] font-normal">({pctHubGeral.toFixed(0)}%)</span>  
                              </td>  
                              {colunasSemanasUnicas.map((semanaNome, i) => {  
                                const valAbsoluto = matrizHubSemana[hubKey][semanaNome] || 0;  
                                const pctDoHub = totalHubAcumulado > 0 ? (valAbsoluto / totalHubAcumulado) * 100 : 0;  
  
                                return (  
                                  <td key={i} className="p-2 text-center font-mono text-zinc-700 dark:text-black-300">  
                                    {valAbsoluto > 0 ? (  
                                      <span>  
                                        <span className="font-bold">{valAbsoluto}</span>  
                                        <span className="text-zinc-400 dark:text-zinc-500 text-[9px] ml-0.5">({pctDoHub.toFixed(0)}%)</span>  
                                      </span>  
                                    ) : (  
                                      <span className="text-zinc-300 dark:text-zinc-700">-</span>  
                                    )}  
                                  </td>  
                                );  
                              })}  
                            </tr>  
                          );  
                        })  
                    ) : (  
                      <tr>  
                        <td colSpan={colunasSemanasUnicas.length + 2} className="p-4 text-center text-zinc-400 italic">  
                          Sem registros.  
                        </td>  
                      </tr>  
                    )}  
                  </tbody>  
                </table>  
              </div>  
            </div>  
  
            <div className={`p-4 rounded-2xl border flex flex-col h-[350px] print:h-auto ${estilo.card} border-zinc-200 dark:border-zinc-800`}>  
              <div className="mb-2">  
                <h4 className="text-[13px] font-bold uppercase tracking-wider text-blue-700">  
                  RESPOSTAS LEADS POR ANALISTA E SEMANA  
                </h4>  
              </div>  
              <div className="w-full flex-1 overflow-x-auto overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 pr-1 scrollbar-thin print:max-h-none print:overflow-visible">  
                <table className="w-full text-left text-xs border-collapse min-w-[380px]">  
                  <thead className="sticky top-0 z-30">  
                    <tr className="bg-[#EE4D2D] dark:bg-[#d44022] text-white border-b border-[#EE4D2D]">  
                      <th className="p-2 text-left bg-[#EE4D2D] dark:bg-[#d44022] font-bold text-[10px] tracking-wider sticky left-0 z-40 min-w-[140px] border-r border-white/10">ANALISTA</th>  
                      <th className="p-2 font-bold text-[10px] tracking-wider text-center min-w-[90px] bg-[#EE4D2D] dark:bg-[#d44022]">TOTAL</th>  
                      {colunasSemanasUnicas.map((semanaNome, i) => (  
                        <th key={i} className="p-2 text-center font-bold text-[10px] tracking-wider min-w-[75px] bg-[#EE4D2D] dark:bg-[#d44022]">  
                          {semanaNome.toUpperCase()}  
                        </th>  
                      ))}  
                    </tr>  
                  </thead>  
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-[11px] text-zinc-700 dark:text-zinc-300">  
                    {Object.keys(matrizAnalistaSemana).length > 0 ? (  
                      Object.keys(matrizAnalistaSemana)  
                        .sort((a, b) => {  
                          const totalA = Object.values(matrizAnalistaSemana[a]).reduce((acc, val) => acc + val, 0);  
                          const totalB = Object.values(matrizAnalistaSemana[b]).reduce((acc, val) => acc + val, 0);  
                          return totalB - totalA;  
                        })  
                        .map((anaKey, idx) => {  
                          const totalAnalistaLeads = Object.values(matrizAnalistaSemana[anaKey]).reduce((a, b) => a + b, 0) || 0;  
                          const pctAnalistaGeral = totalLeads > 0 ? (totalAnalistaLeads / totalLeads) * 100 : 0;  
  
                          return (  
                            <tr key={idx} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">  
                              <td className="p-2 font-semibold bg-white/95 dark:bg-zinc-950/95 text-zinc-900 dark:text-zinc-100 sticky left-0 z-20 border-r border-zinc-200 dark:border-zinc-800 truncate" title={anaKey}>  
                                {anaKey}  
                              </td>  
                              <td className="p-2 text-center font-bold font-mono bg-zinc-500/5 text-[#EE4D2D]">  
                                {totalAnalistaLeads} <span className="text-zinc-400 dark:text-blue-500 text-[10px] font-normal">({pctAnalistaGeral.toFixed(0)}%)</span>  
                              </td>  
                              {colunasSemanasUnicas.map((semanaNome, i) => {  
                                const valAbsoluto = matrizAnalistaSemana[anaKey][semanaNome] || 0;  
                                const pctDoAnalista = totalAnalistaLeads > 0 ? (valAbsoluto / totalAnalistaLeads) * 100 : 0;  
  
                                return (  
                                  <td key={i} className="p-2 text-center font-mono text-zinc-700 dark:text-black-300">  
                                    {valAbsoluto > 0 ? (  
                                      <span>  
                                        <span className="font-bold">{valAbsoluto}</span>  
                                        <span className="text-zinc-400 dark:text-zinc-500 text-[9px] ml-0.5">({pctDoAnalista.toFixed(0)}%)</span>  
                                      </span>  
                                    ) : (  
                                      <span className="text-zinc-300 dark:text-zinc-700">-</span>  
                                    )}  
                                  </td>  
                                );  
                              })}  
                            </tr>  
                          );  
                        })  
                    ) : (  
                      <tr>  
                        <td colSpan={colunasSemanasUnicas.length + 2} className="p-4 text-center text-zinc-400 italic">  
                          Sem registros.  
                        </td>  
                      </tr>  
                    )}  
                  </tbody>  
                </table>  
              </div>  
            </div>  
          </div>  
        </div>  
  
      </div>  
    </div>  
  );  
}