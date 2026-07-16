"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AiChatProps {
  dadosOperacao: any;
}

// ── Sugestões rápidas para o gestor ────────────────────────────────────────
const SUGESTOES_RAPIDAS = [
  "Resumo geral da operação",
  "Qual analista está performando melhor?",
  "Quais hubs precisam de atenção?",
  "Como está o SLA essa semana?",
  "Quantos drivers inativos temos?",
  "Comparativo semanal de atendimentos",
];

// ── Componente principal ───────────────────────────────────────────────────
export default function AiChat({ dadosOperacao }: AiChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Lógica para Arrastar o Botão Flutuante ────────────────────────────────
  const [position, setPosition] = useState({ x: 850, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);

  // Referência para calcular o deslocamento do mouse sem re-renders extras
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 850, posY: 200 });

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return; // Apenas com o botão esquerdo
    setIsDragging(true);
    setHasDragged(false);

    dragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y,
    };

    e.preventDefault(); // Evita bugs de seleção de conteúdo interno do botão
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStart.current.mouseX;
      const deltaY = e.clientY - dragStart.current.mouseY;

      // Se moveu mais de 4px, conta como arrasto e bloqueia o clique de abrir o chat
      if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
        setHasDragged(true);
      }

      setPosition({
        x: dragStart.current.posX + deltaX,
        y: dragStart.current.posY + deltaY,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const enviarPergunta = useCallback(
    async (pergunta: string) => {
      if (!pergunta.trim() || isLoading) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: pergunta.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsLoading(true);
      setError(null);

      try {
        const history = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        let data;

        // 🟢 1ª OPÇÃO: Tenta enviar para a sua API principal (Groq)
        console.log("Tentando obter resposta da API principal (Groq)...");
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: pergunta.trim(),
            data: dadosOperacao,
            history,
          }),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          // 🟠 2ª OPÇÃO (FALLBACK): Se o Groq der erro (Ex: 429 Limite Diário), aciona o ChatGPT
          console.warn("Groq indisponível ou limite diário atingido. Acionando ChatGPT...");

          // ==========================================
          // CONFIGURAÇÃO DO SEU CHATGPT (OPENAI)
          // ==========================================
          const CONFIG_OPENAI = {
            // Se você criou uma rota própria no seu projeto (Ex: "/api/chat-openai"), configure aqui:
            URL_DA_API: "/api/chat-openai", // <--- Deixe esta rota ou mude para o seu endpoint
            
            // Caso vá testar direto no client-side com fetch direto para a OpenAI (não recomendado para produção):
            // URL_DIRETA_OPENAI: "https://api.openai.com/v1/chat/completions",
            // CHAVE_API_DIRETA: "SUA_API_KEY_DA_OPENAI_AQUI", 
            // MODELO: "gpt-4o-mini" // Modelo rápido e muito barato
          };
          // ==========================================

          const fallbackRes = await fetch(CONFIG_OPENAI.URL_DA_API, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              // Caso decida fazer a requisição DIRETAMENTE para a OpenAI no frontend (descomente as 2 linhas abaixo se necessário):
              // "Authorization": `Bearer ${CONFIG_OPENAI.CHAVE_API_DIRETA}`
            },
            body: JSON.stringify({
              question: pergunta.trim(),
              data: dadosOperacao,
              history,
              // Caso o fetch seja direto para a OpenAI, o body precisa seguir o padrão deles:
              /*
              model: CONFIG_OPENAI.MODELO,
              messages: [
                { role: "system", content: "Você é o Beacon DD4.0..." },
                ...history,
                { role: "user", content: pergunta.trim() }
              ]
              */
            }),
          });

          if (!fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            throw new Error(fallbackData.error || "Ambas as APIs falharam em responder.");
          }

          data = await fallbackRes.json();
        }

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.answer || data.choices?.[0]?.message?.content, // Trata o retorno dependendo de onde veio
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setError(err.message || "Erro de conexão ao tentar processar sua pergunta");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, messages, dadosOperacao]
  );

  const formatarResposta = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- /g, '\n• ')
      .replace(/\n(\d+)\. /g, '\n<span style="color:#ee4d2d;font-weight:bold">$1.</span> ')
      .replace(/💡/g, '<span style="font-size:1.2em">💡</span>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Botão flutuante - Arrastável */}
      <button
        onMouseDown={handleMouseDown}
        onClick={() => {
          if (!hasDragged) {
            setIsOpen(!isOpen);
          }
        }}
        style={{
          position: "absolute",
          top: `${position.y}px`,     
          left: `${position.x}px`,    
          width: "210px",        
          height: "50px",       
          borderRadius: "30%",
          background: "linear-gradient(135deg, #ee4d2d 0%, #ff5722 100%)", 
          border: "3px solid #ffffff", 
          cursor: isDragging ? "grabbing" : "grab",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isDragging 
            ? "0 16px 36px rgba(238,77,45,0.6)" 
            : "0 8px 24px rgba(238,77,45,0.4)", 
          zIndex: 9999,
          transition: isDragging ? "none" : "transform 0.2s, box-shadow 0.2s",
          padding: 0,
          userSelect: "none",
        }}
        onMouseEnter={(e) => {
          if (!isDragging) {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(238,77,45,0.6)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragging) {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(238,77,45,0.4)";
          }
        }}
        title="Falar com o Beacon DD4.0 (Clique para abrir / Arraste para mover)"
      >
        <span style={{ fontSize: "28px", lineHeight: "1" }}>🛰️</span>
        <span style={{ 
          fontSize: "12px", 
          fontWeight: "900", 
          color: "yellow", 
          marginTop: "2px",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          Beacon AI
        </span>
        
        <span 
          style={{
            position: "absolute",
            bottom: "4px",
            right: "4px",
            width: "14px",
            height: "14px",
            backgroundColor: "#10b981",
            borderRadius: "50%",
            border: "2px solid white",
            zIndex: 1,
          }}
        />
      </button>

      {/* Painel do Chat */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: "250px",    
            left: "854px",    
            width: "720px",
            maxWidth: "calc(100vw - 48px)",
            height: "600px",
            maxHeight: "calc(100vh - 150px)",
            backgroundColor: "#111827",
            borderRadius: "16px",
            border: "1px solid #374151",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9998,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "linear-gradient(135deg, #ee4d2d 0%, #ff5722 100%)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "Blue",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid white",
                position: "relative",
                fontSize: "20px"
              }}
            >
              🦊
              <span 
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "15px",
                  height: "15px",
                  backgroundColor: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            </div>
            
            <div>
              <div style={{ display: "flex", gridGap: "6px", alignItems: "center" }}>
                <span style={{ fontWeight: "800", color: "white", fontSize: "16px", letterSpacing: "0.3px" }}>
                  Beacon DD4.0
                </span>
                <span style={{
                  backgroundColor: "white",
                  color: "#ee4d2d",
                  fontSize: "9px",
                  fontWeight: "900",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  textTransform: "uppercase"
                }}>
                  IA
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.9)", fontWeight: "500" }}>
                Co-piloto de Gestão de Frota • Shopee DD
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 10px" }}>
                <div style={{ fontSize: "44px", marginBottom: "16px" }}>🧡</div>
                <div style={{ color: "#e5e7eb", fontSize: "15px", marginBottom: "24px", lineHeight: "1.6" }}>
                  Oi, sou o <strong>Beacon DD4.0</strong><br /> 
                  Sua IA assistente de Drivers Day, me faça uma pergunta! :)
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", justifyContent: "center" }}>
                  {SUGESTOES_RAPIDAS.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => enviarPergunta(sug)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: "20px",
                        border: "1px solid #374151",
                        backgroundColor: "#1f2937",
                        color: "#d1d5db",
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.borderColor = "#ee4d2d";
                        (e.target as HTMLElement).style.color = "#ee4d2d";
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.borderColor = "#374151";
                        (e.target as HTMLElement).style.color = "#d1d5db";
                      }}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    backgroundColor: msg.role === "user" ? "#ee4d2d" : "#1f2937",
                    color: msg.role === "user" ? "white" : "#e5e7eb",
                    fontSize: "13px",
                    lineHeight: "1.5",
                    border: msg.role === "assistant" ? "1px solid #374151" : "none",
                  }}
                >
                  {msg.role === "assistant" ? (
                    <div dangerouslySetInnerHTML={{ __html: formatarResposta(msg.content) }} />
                  ) : (
                    msg.content
                  )}
                  <div
                    style={{
                      fontSize: "10px",
                      color: msg.role === "user" ? "rgba(255,255,255,0.6)" : "#6b7280",
                      marginTop: "4px",
                      textAlign: "right",
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "12px 18px",
                    borderRadius: "16px 16px 16px 4px",
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    display: "flex",
                    gap: "6px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "#ee4d2d",
                          animation: `aiChatPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "12px", marginLeft: "8px" }}>
                    Analisando dados...
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171",
                  fontSize: "13px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid #374151",
              backgroundColor: "#0d1117",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarPergunta(input);
                }
              }}
              placeholder="Fale com o Beacon DD4.0..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "12px",
                border: "1px solid #374151",
                backgroundColor: "#1f2937",
                color: "white",
                fontSize: "13px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#ee4d2d")}
              onBlur={(e) => (e.target.style.borderColor = "#374151")}
            />
            <button
              onClick={() => enviarPergunta(input)}
              disabled={isLoading || !input.trim()}
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                border: "none",
                background:
                  isLoading || !input.trim()
                    ? "#374151"
                    : "linear-gradient(135deg, #ee4d2d, #ff5722)",
                cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes aiChatPulse {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}