"use client";

import { useEffect, useState } from "react";
import Dashboard from "./Dashboard";

export default function Home() {
  const [baseMotoristas, setBaseMotoristas] = useState<any[]>([]);  
const [status, setStatus] = useState(""); 
const [valorK2, setValorK2] = useState(0); 
const [disparosRealizados, setDisparosRealizados] = useState(0); 
const [disparosData, setDisparosData] = useState<{semana: string}[]>([]); 
const [mediaAtendimentoAnalista, setMediaAtendimentoAnalista] = useState(0); 

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

  // 🔍 Módulo de Busca e Formulário de Tratamento
  const [termoBusca, setTermoBusca] = useState("");
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<any | null>(null);
  
  // 📝 Campos do Formulário (Página2 - Colunas K a O)
  const [respostaK, setRespostaK] = useState("");
  const [respostaL, setRespostaL] = useState("");
  const [respostaM, setRespostaM] = useState(""); 
  const [respostaN, setRespostaN] = useState(""); 
  const [respostaO, setRespostaO] = useState("");
  const [salvandoTratamento, setSalvandoTratamento] = useState(false);

  useEffect(() => {  
    // 💡 Callback JSONP para Receber os dados da Planilha  
    (window as any).processarDadosPlanilha = (matrizCrua: any[][]) => {    
      if (Array.isArray(matrizCrua) && matrizCrua.length > 1) {    
        // ========================================
        // CONTAGEM DE DISPAROS: Coluna L (índice 11)
        // Coluna K (índice 10) = semana do disparo
        // ========================================
        const disparosColetados: {semana: string}[] = [];
        matrizCrua.slice(1).forEach((linha) => {
          const colL = String(linha[11] || '').trim(); // Coluna L = marcador de disparo
          if (colL !== '') {
            const semanaK = String(linha[10] || '').trim(); // Coluna K = semana
            disparosColetados.push({ semana: semanaK });
          }
        });
        setDisparosData(disparosColetados);
        const totalDisparos = disparosColetados.length;
        setValorK2(totalDisparos);
        setDisparosRealizados(totalDisparos);    
          
        const cabecalho = matrizCrua[0].map(c => String(c).trim().toLowerCase());  
              
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
    
    // 💡 Callback JSONP para Receber Confirmação de Gravação  
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
    
    // Callback para media de atendimentos da aba "Atendimentos DD.40" celula F6
    (window as any).processarMediaAtendimentos = (matrizMedia: any[][]) => {
      if (Array.isArray(matrizMedia) && matrizMedia.length >= 6) {
        // F6 = coluna F (indice 5), linha 6 (indice 5 no array zero-based, mas indice 6 contando header)
        const valorF6 = Number(matrizMedia[5]?.[5]) || 0;
        setMediaAtendimentoAnalista(valorF6);
      }
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
    document.body.appendChild(script);

    // Segunda chamada JSONP para buscar media de atendimento da aba "Atendimentos DD.40"
    const scriptMediaVelho = document.getElementById("script-media-google");
    if (scriptMediaVelho) scriptMediaVelho.remove();
    const urlMedia = `${appsScriptUrl}?action=buscarMediaAtendimentos&callback=processarMediaAtendimentos&_=${new Date().getTime() + 1}`;
    const scriptMedia = document.createElement("script");
    scriptMedia.id = "script-media-google";
    scriptMedia.src = urlMedia;
    scriptMedia.async = true;
    document.body.appendChild(scriptMedia);
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
  // 🔥 MOTOR DE FILTRAGEM CORRIGIDO (COMPATÍVEL COM MULTI-SELECT)
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
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-10 font-sans selection:bg-orange-500/30 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* 🦊 NOVO HEADER EM LINHA (25% TÍTULO E 75% DRIVER LOCATE COPIANDO O DESIGN DA CAIXA) */}
        <div className="flex flex-col lg:flex-row items-center gap-6 pb-6 border-b border-zinc-800/600 w-full">
          
          {/* LADO ESQUERDO (25%): Título com Lobinho e Status Oculto da Sincronização */}
          <div className="w-full lg:w-1/4 flex items-center gap-3 shrink-0">
          <div className="w-10 h-12 rounded-full bg-[#EE4D2D]/10 dark:bg-[#EE4D2D]/20 border border-[#EE4D2D]/30 flex items-center justify-center text-2xl shadow-md select-none transition-transform hover:scale-105">
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
          
          {/* LADO DIREITO (75%): Módulo Driver Locate integrado lado a lado */}
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

                {/* Menu Flutuante de Resultados do Módulo de Busca */}
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

        {/* 🎚️ Renderização do Dashboard */}
        {baseMotoristas.length > 0 ? (
         <Dashboard   
         listaFiltradaDash={listaFiltradaDash}  
         modaisPagina2={modaisPagina2}  
         classesTema={classesTema}  
         disparosRealizados={valorK2}  
         disparosData={disparosData}  
         mediaAtendimentoAnalista={mediaAtendimentoAnalista}  
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

        {/* 🚀 Camada: Aba Suspensa / Modal Centralizado */}
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
    </div>
  );
}