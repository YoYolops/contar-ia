"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

/**
 * Configuração global do parser Markdown (marked).
 * breaks: true → Quebra de linha simples vira <br>
 * gfm: true → Habilita recursos do GitHub Flavored Markdown
 */
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Limpa possíveis duplicações e resumos indesejados
 * no texto da história gerada pela IA.
 *
 * Problemas tratados:
 * - Prefixo "História:" no início do texto
 * - Resumos curtos antes do título principal
 * - Títulos duplicados (# Título)
 * @param story Texto bruto da história
 * @returns Texto limpo e normalizado
 */
function cleanStory(story: string): string {
  if (!story) return story;

  // Remove "História:" no início (comum em respostas duplicadas)
  let cleaned = story.replace(/^História:\s*/i, "");

  // Detecta título principal (# Título)
  const titleMatch = story.match(/^#\s+(.+)$/m);

  if (titleMatch) {
    const title = titleMatch[1];

    // Escapa caracteres especiais para uso em RegExp
    const titleRegex = new RegExp(
      `^#\\s+${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
      "gm"
    );

    const matches = story.match(titleRegex);

    // Se houver mais de um título igual → provável duplicação
    if (matches && matches.length > 1) {
      const firstTitleIndex = story.indexOf(`# ${title}`);

      if (firstTitleIndex > 0) {
        const beforeTitle = story.substring(0, firstTitleIndex).trim();

        /**
         * Se o texto antes do título for curto e não contiver subtítulos,
         * assume-se que é um resumo gerado automaticamente.
         */
        if (beforeTitle.length < 500 && !beforeTitle.includes("##")) {
          cleaned = story.substring(firstTitleIndex);
        }
      }
    }
  }

  return cleaned.trim();
}

/**
 * Props do componente StoryContent.
 */
interface StoryContentProps {
  /**
   * Texto da história em Markdown.
   */
  story: string;

  /**
   * Indica se a história ainda está sendo gerada.
   */
  loading: boolean;

  /**
   * Indica se ocorreu erro durante a geração.
   */
  hasError?: boolean;
}

/**
 * Componente responsável por exibir a história gerada.
 *
 * Funcionalidades principais:
 * - Exibição de loading com animações e progresso
 * - Mensagens dinâmicas baseadas no tempo
 * - Efeito de digitação (typewriter)
 * - Renderização de Markdown em HTML
 * - Tratamento de estados: carregando, erro, aguardando ou pronto
 *
 * @component
 */
export function StoryContent({
  story,
  loading,
  hasError,
}: StoryContentProps) {

  /**
   * Texto parcialmente "digitado" (efeito typewriter).
   */
  const [typedStory, setTypedStory] = useState("");

  /**
   * HTML renderizado a partir do Markdown.
   */
  const [renderedStory, setRenderedStory] = useState("");

  /**
   * Mensagem exibida durante o carregamento.
   */
  const [loadingMessage, setLoadingMessage] = useState(
    "Criando sua história mágica..."
  );

  /**
   * Tempo total de carregamento em segundos.
   */
  const [loadingTime, setLoadingTime] = useState(0);

  /**
   * Atualiza dinamicamente a mensagem de loading
   * conforme o tempo passa.
   */
  useEffect(() => {
    if (!loading) {
      setLoadingTime(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingTime((prev) => {
        const newTime = prev + 1;

        // Seleciona mensagem baseada no tempo
        if (newTime < 10) {
          setLoadingMessage("Validando o conteúdo...");
        } else if (newTime < 30) {
          setLoadingMessage("Gerando a história...");
        } else if (newTime < 60) {
          setLoadingMessage("Verificando a segurança...");
        } else if (newTime < 90) {
          setLoadingMessage("Validando os requisitos...");
        } else if (newTime < 120) {
          setLoadingMessage("Revisando e formatando...");
        } else {
          setLoadingMessage("Finalizando os últimos detalhes...");
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading]);

  /**
   * Efeito responsável por:
   * - Resetar estado ao iniciar carregamento
   * - Limpar história
   * - Aplicar efeito de digitação
   * - Renderizar Markdown progressivamente
   */
  useEffect(() => {

    // Reset ao iniciar loading
    if (loading) {
      setTypedStory("");
      setRenderedStory("");
      setLoadingTime(0);
      setLoadingMessage("Criando sua história mágica...");
      return;
    }

    // Processar apenas se houver história válida
    if (!loading && story && story.trim().length > 0) {

      const cleanedStory = cleanStory(story);
      setTypedStory("");

      let i = 0;

      const interval = setInterval(() => {
        const currentText = cleanedStory.slice(0, i);

        setTypedStory(currentText);

        // Converte Markdown → HTML conforme digitação
        setRenderedStory(marked.parse(currentText) as string);

        i++;

        if (i > cleanedStory.length) clearInterval(interval);
      }, 5);

      return () => clearInterval(interval);
    }
  }, [loading, story]);

  /**
   * Estados derivados para controle de renderização.
   */
  const showLoading = loading;
  const hasStory = story && story.trim().length > 0;

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm min-h-[400px]">

      {/* ===== ESTADO: CARREGANDO ===== */}
      {showLoading ? (
        <div className="w-full flex flex-col items-center justify-center py-20">

          {/* Spinner principal */}
          <div className="relative">
            <div
              className="animate-spin w-16 h-16 rounded-full border-4 border-teal-100"
              style={{
                borderTopColor: "#2dd4bf",
                borderRightColor: "#2dd4bf",
                borderBottomColor: "transparent",
                borderLeftColor: "transparent",
              }}
            />

            {/* Spinner interno (rotação reversa) */}
            <div
              className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent animate-spin"
              style={{
                borderTopColor: "#14b8a6",
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            />
          </div>

          {/* Mensagem dinâmica */}
          <p className="mt-6 text-slate-700 font-semibold text-lg animate-pulse">
            {loadingMessage}
          </p>

          {/* Indicador de tempo */}
          <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
            <div className="flex gap-1">
              <div className="w-1 h-1 rounded-full bg-teal-400 animate-bounce" />
              <div
                className="w-1 h-1 rounded-full bg-teal-400 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-1 h-1 rounded-full bg-teal-400 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>

            <span className="ml-2">
              {loadingTime > 0 &&
                `${Math.floor(loadingTime / 60)}:${String(
                  loadingTime % 60
                ).padStart(2, "0")}`}
            </span>
          </div>

          {/* Barra de progresso animada */}
          <div className="mt-6 w-full max-w-md">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-teal-500 to-teal-400 rounded-full animate-pulse"
                style={{
                  width: `${Math.min(95, 10 + loadingTime * 0.5)}%`,
                  transition: "width 0.5s ease-out",
                }}
              />
            </div>
          </div>

          {/* Dica ao usuário */}
          <p className="mt-6 text-slate-400 text-sm max-w-md text-center">
            Isso pode levar alguns minutos. Estamos criando uma história
            personalizada e única para você!
          </p>
        </div>

      ) : hasStory ? (

        /* ===== ESTADO: HISTÓRIA PRONTA ===== */
        <>
          <div className="mb-6">
            <span className="text-teal-400 font-bold text-sm tracking-wide uppercase">
              Sua história está pronta!
            </span>
          </div>

          <div
            className="markdown-content text-slate-600"
            dangerouslySetInnerHTML={{ __html: renderedStory }}
          />
        </>

      ) : hasError ? (

        /* ===== ESTADO: ERRO ===== */
        // Nenhum conteúdo exibido (Alert externo já mostra erro)
        null

      ) : !loading && !hasStory ? (

        /* ===== ESTADO: AGUARDANDO ===== */
        <div className="w-full flex flex-col items-center justify-center py-20">
          <p className="text-slate-500 font-medium">
            Aguardando dados da história...
          </p>
        </div>

      ) : null}
    </div>
  );
}
