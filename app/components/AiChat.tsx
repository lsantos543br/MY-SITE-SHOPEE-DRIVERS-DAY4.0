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

          const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: pergunta.trim(),
              data: dadosOperacao,
              history,
            }),
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Erro ao processar pergunta");
          }

          const assistantMsg: Message = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: data.answer,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMsg]);
        } catch (err: any) {
          setError(err.message || "Erro de conexão");
        } finally {
          setIsLoading(false);
        }
      },
      [isLoading, messages, dadosOperacao]
    );

    const formatarResposta = (text: string) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n- /g, '\n• ')
        .replace(/\n(\d+)\. /g, '\n<span style="color:#ee4d2d;font-weight:bold">$1.</span> ')
        .replace(/💡/g, '<span style="font-size:1.2em">💡</span>')
        .replace(/\n/g, '<br/>');
    };

    return (
      <>
        {/* Botão flutuante - Aumentado para 80px e usando um design moderno sem quebra de imagem */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: "fixed",
            top: "24px",     
            left: "24px",    
            width: "80px",        // Aumentado de 60px para 80px
            height: "80px",       // Aumentado de 60px para 80px
            borderRadius: "50%",
            background: "linear-gradient(135deg, #ee4d2d 0%, #ff5722 100%)", // Gradiente Shopee super moderno
            border: "3px solid #ffffff", 
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 8px 24px rgba(238,77,45,0.4)", 
            zIndex: 9999,
            transition: "transform 0.2s, box-shadow 0.2s",
            padding: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1.08)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(238,77,45,0.6)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(238,77,45,0.4)";
          }}
          title="Falar com o Beacon DD4.0"
        >
          {/* Emoji de Raposinha Laranja (Mascote) + Texto compacto para ficar lindo */}
          <span style={{ fontSize: "28px", lineHeight: "1" }}>🦊</span>
          <span style={{ 
            fontSize: "10px", 
            fontWeight: "900", 
            color: "white", 
            marginTop: "2px",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Beacon
          </span>
          
          {/* Ponto verde de Online */}
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
              top: "120px",     // Espaço ligeiramente maior para o botão de 80px
              left: "24px",    
              width: "420px",
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
            {/* Header - Customizado */}
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
              {/* Avatar do Header usando Emoji */}
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: "white",
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
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
              {/* Novo texto de Boas-vindas personalizado por você */}
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

              {/* Mensagens */}
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

              {/* Loading */}
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

              {/* Error */}
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