"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

type Props = {
  label: string;
  opcoes: string[];
  valorString: string;
  onMudar: (val: string) => void;
  estilo?: {
    selectDropdown?: string;
    menuFlutuante?: string;
    itemHover?: string;
    textoLabels?: string;
  };
};

export default function MultiSelectFiltro({ label, opcoes = [], valorString, onMudar, estilo }: Props) {
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
    const novosFlegados = [...flegadosAtuais];
    const index = novosFlegados.findIndex(x => x.toLowerCase() === opcao.toLowerCase());
    if (index > -1) { novosFlegados.splice(index, 1); } else { novosFlegados.push(opcao); }
    if (novosFlegados.length === 0) { onMudar("TODOS"); } else { onMudar(novosFlegados.join(', ')); }
  };

  const s = {
    selectDropdown: estilo?.selectDropdown || 'bg-white border-slate-300 text-slate-800 hover:bg-slate-50',
    menuFlutuante: estilo?.menuFlutuante || 'bg-white border-slate-200 shadow-xl text-slate-800',
    itemHover: estilo?.itemHover || 'hover:bg-slate-100 text-slate-700',
    textoLabels: estilo?.textoLabels || 'text-slate-400',
  };

  return (
    <div ref={refContainer} className="space-y-1 relative w-full">
      <label className={`text-[10px] font-extrabold uppercase tracking-wider block ${s.textoLabels}`}>
        {label}
      </label>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        aria-label={label}
        className={`w-full p-2.5 rounded-xl text-xs font-bold border flex items-center justify-between transition-all outline-none ${s.selectDropdown}`}
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
        <div className={`absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border p-1 divide-y divide-zinc-800/10 shadow-xl ${s.menuFlutuante}`}>
          <div
            onClick={() => manipularCliqueOpcao("TODOS")}
            className={`flex items-center gap-2 px-2.5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors ${s.itemHover}`}
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
                className={`flex items-center gap-2 px-2.5 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${s.itemHover}`}
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
