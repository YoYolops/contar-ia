"use client";

/**
 * ============================================================
 * PÁGINA DE EXIBIÇÃO E GERAÇÃO DE HISTÓRIA
 * ============================================================
 *
 * Responsabilidades principais:
 * • Exibir uma história já existente (via ID na URL)
 * • Gerar uma nova história a partir do contexto (StoryContext)
 * • Permitir salvar a história na biblioteca do usuário
 * • Gerenciar autenticação e sessão
 * • Controlar cancelamento de requisições em andamento
 * • Tratar erros, avisos e conteúdo impróprio
 * • Exibir exportação (PDF/DOCX) e aviso legal
 *
 * Observações importantes:
 * • Esta é uma Client Component do Next.js (usa hooks e estado)
 * • Utiliza AbortController para cancelar requisições longas
 * • Implementa timeout de segurança para geração de histórias
 * • Evita requisições duplicadas com refs de controle
 */
import { useEffect, useState, useRef, Suspense } from "react";
import { StorySidebar } from "@/components/story/StorySidebar";
import { StoryContent } from "@/components/story/StoryContent";
import { ExportBar } from "@/components/story/ExportBar";
import { useStory } from "@/contexts/StoryContext";
import { useSession } from "@/contexts/SessionContext";
import { Disclaimer } from "@/components/story/Disclaimer";
import { Alert } from "@/components/Alert";
import { StoryGenerationRequest, StoryGenerationResponse } from "@/types/story";
import { useRouter, useSearchParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";

export default function StoryPage() {
    return <Suspense><StoryPageContent /></Suspense>
}

function StoryPageContent() {

  /**
   * ============================================================
   * CONTEXTOS E HOOKS DE NAVEGAÇÃO
   * ============================================================
   */
  const { story: storyData } = useStory(); // Dados da história fornecidos pelo contexto
  const router = useRouter(); // Navegação programática
  const searchParams = useSearchParams(); // Acesso aos parâmetros da URL
  const storyId = searchParams.get("id"); // ID da história (se existente)
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://8522-2001-12f0-9c1-664-44d4-121b-454a-d470.ngrok-free.app";

  const { data: session, isLoading, logOutWithReason } = useSession();

  /**
   * ============================================================
   * REFS PARA CONTROLE DE REQUISIÇÕES
   * ============================================================
   *
   * Usadas para evitar chamadas duplicadas e permitir cancelamento.
   */
  const isFetchingRef = useRef(false); // Indica se já há uma requisição em andamento
  const lastStoryKeyRef = useRef<string>(""); // Chave da última história gerada
  const abortControllerRef = useRef<AbortController | null>(null); // Controller atual
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null); // Timeout da requisição

  /**
   * ============================================================
   * ESTADOS DO COMPONENTE
   * ============================================================
   */
  const [story, setStory] = useState(""); // Conteúdo da história
  const [loading, setLoading] = useState(true); // Controle de loading
  const [issues, setIssues] = useState<string[]>([]); // Avisos/erros retornados pelo backend
  const [isSaving, setIsSaving] = useState(false); // Estado de salvamento
  const [isSaved, setIsSaved] = useState(false); // Indica se já foi salva
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(storyId);
  const [saveError, setSaveError] = useState<string | null>(null); // Erro ao salvar

  /**
   * Atualiza estado quando o ID na URL muda
   */
  useEffect(() => {
    setCurrentStoryId(storyId);
    if (storyId) setIsSaved(true);
  }, [storyId]);

  /**
   * ============================================================
   * UTILIDADES
   * ============================================================
   */

  /**
   * Converte valor numérico da faixa etária em rótulo textual.
   */
  const getAgeLabel = (val: number) => {
    if (val < 33) return "3-5 anos";
    if (val < 66) return "6-8 anos";
    return "9-12 anos";
  };

  /**
   * ============================================================
   * CANCELAMENTO DE REQUISIÇÃO ATUAL
   * ============================================================
   *
   * Cancela fetch, timeout e reseta flags internas.
   */
  const cancelCurrentRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    isFetchingRef.current = false;
    setLoading(false);
  };

  /**
   * ============================================================
   * SALVAR HISTÓRIA
   * ============================================================
   *
   * Fluxos possíveis:
   * 1) Salvar história já existente
   * 2) Criar nova história no backend
   * 3) Lidar com sessão expirada
   */
  const handleSaveStory = async () => {
    if (!session?.user_id || !story || isSaving || isSaved) return;

    setIsSaving(true);
    setSaveError(null);

    try {

      /**
       * Caso já exista ID da história → salvar associação ao usuário
       */
      if (currentStoryId) {
        const res = await fetch(`${backendUrl}/stories/${currentStoryId}/save?user_id=${session.user_id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        });

        if (res.status === 401) {
          logOutWithReason("Sessão expirada. Faça login novamente.");
          router.push("/login");
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || `HTTP error! status: ${res.status}`);
        }

        setIsSaved(true);
        return;
      }

      /**
       * Caso não exista ID → criar nova história
       */
      const res = await fetch(`${backendUrl}/stories/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`,
        },
        body: JSON.stringify({
          creator_id: session.user_id,
          title: storyData.theme || "História",
          contents: story,
        }),
      });

      const data = await res.json();

      if (res.status === 401) {
        logOutWithReason("Sessão expirada. Faça login novamente.");
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(data.detail || "Erro ao salvar história.");
      }

      /**
       * Se backend retornar ID, atualizar URL sem recarregar
       */
      if (data.story_id) {
        setCurrentStoryId(data.story_id);
        setIsSaved(true);
        router.replace(`/story?id=${data.story_id}`);
      } else {
        setIsSaved(true);
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar história.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * ============================================================
   * EFEITO PRINCIPAL — GERAÇÃO OU CARREGAMENTO DA HISTÓRIA
   * ============================================================
   */
  useEffect(() => {

    /**
     * Redireciona para login se não autenticado
     */
    if (isLoading) return;

    if (!session?.token) {
        router.push("/login");
        return;
    }

    /**
     * ============================================================
     * CASO 1 — CARREGAR HISTÓRIA EXISTENTE POR ID
     * ============================================================
     */
    if (storyId) {
      const controller = new AbortController();

      setLoading(true);
      setIssues([]);
      setIsSaved(true);

      fetch(`${backendUrl}/stories/by-id/${storyId}?user_id=${session?.user_id ?? ""}`, {
        method: "GET",
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || `HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          setStory(data.contents || "");
        })
        .catch((err) => {
          if (err instanceof Error && err.name === "AbortError") return;
          setStory("");
          setIssues([err.message || "Erro ao carregar a história."]);
        })
        .finally(() => {
          setLoading(false);
        });

      return () => {
        controller.abort();
      };
    }

    /**
     * ============================================================
     * CANCELAMENTO VIA sessionStorage
     * ============================================================
     */
    const shouldCancel = sessionStorage.getItem("cancel_story_request");
    if (shouldCancel === "true") {
      cancelCurrentRequest();
      sessionStorage.removeItem("cancel_story_request");
      setLoading(false);
      setStory("");
      setIssues([]);
      isFetchingRef.current = false;
      return;
    }

    /**
     * ============================================================
     * VERIFICAÇÃO DE DADOS DO CONTEXTO
     * ============================================================
     */
    if (!storyData.theme || !storyData.value) {
      const checkDataTimeout = setTimeout(() => {
        if (!storyData.theme || !storyData.value) {
          setLoading(false);
          setStory("Dados da história não encontrados. Por favor, crie uma nova história.");
          setIssues([]);
          isFetchingRef.current = false;
        }
      }, 500);

      return () => {
        clearTimeout(checkDataTimeout);
      };
    }

    /**
     * ============================================================
     * CONTROLE PARA EVITAR REQUISIÇÕES DUPLICADAS
     * ============================================================
     */
    const currentStoryKey = JSON.stringify({
      theme: storyData.theme,
      value: storyData.value,
      ageGroup: storyData.ageGroup,
      setting: storyData.setting,
      characters: [...(storyData.characters || [])].sort()
    });

    if (lastStoryKeyRef.current !== currentStoryKey) {
      if (isFetchingRef.current) {
        cancelCurrentRequest();
      }
      setIssues([]);
      setStory("");
      setLoading(true);
      lastStoryKeyRef.current = currentStoryKey;
    } else {
      if (isFetchingRef.current) return;
      setIssues([]);
      setStory("");
      setLoading(true);
    }

    isFetchingRef.current = true;

    /**
     * ============================================================
     * CONFIGURAÇÃO DO ABORT CONTROLLER E TIMEOUT
     * ============================================================
     */
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current === abortController) {
        abortController.abort();
        console.error("Timeout: A requisição demorou mais de 5 minutos");
      }
    }, 300000);

    timeoutIdRef.current = timeoutId;

    /**
     * ============================================================
     * FUNÇÃO ASSÍNCRONA DE GERAÇÃO DA HISTÓRIA
     * ============================================================
     */
    async function fetchStory() {

      if (abortController.signal.aborted) {
        isFetchingRef.current = false;
        return;
      }

      const storyRequest: StoryGenerationRequest = {
        theme: storyData.theme,
        age_group: getAgeLabel(storyData.ageGroup),
        educational_value: storyData.value,
        setting: storyData.setting,
        characters: storyData.characters,
        title: storyData.theme,
        creator_id: session?.user_id,
      };

      try {
        const res = await fetch(`${backendUrl}/stories/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storyRequest),
          signal: abortController.signal,
        });

        if (abortController.signal.aborted) return;

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        if (timeoutIdRef.current === timeoutId) {
          clearTimeout(timeoutId);
          timeoutIdRef.current = null;
        }

        const data: StoryGenerationResponse = await res.json();

        if (abortController.signal.aborted || abortControllerRef.current !== abortController) {
          return;
        }

        /**
         * Processamento da resposta da geração
         */
        if (data.story_markdown && data.story_markdown.trim().length > 0) {

          const relevantIssues = (data.issues || []).filter(issue => {
            const issueLower = issue.toLowerCase();
            return !issueLower.includes("história não foi gerada") &&
                   !issueLower.includes("erro ao gerar história") &&
                   !issueLower.includes("conteúdo sensível detectado") &&
                   !issueLower.includes("conteúdo impróprio");
          });

          setIssues(relevantIssues.length > 0 ? relevantIssues : []);
          setStory(data.story_markdown);

        } else {

          if (data.issues && data.issues.length > 0) {
            setIssues(data.issues);
            setStory("");
          } else {
            setStory("Não foi possível gerar a história.");
            setIssues([]);
          }
        }

      } catch (error) {

        if (error instanceof Error && error.name === "AbortError") {
          if (abortControllerRef.current === abortController) {
            isFetchingRef.current = false;
            abortControllerRef.current = null;
            if (timeoutIdRef.current === timeoutId) {
              clearTimeout(timeoutId);
              timeoutIdRef.current = null;
            }
          }
          return;
        }

        if (abortController.signal.aborted || abortControllerRef.current !== abortController) {
          return;
        }

        console.error("Erro ao gerar história:", error);

        let errorMessage = "Erro ao gerar a história. Por favor, tente novamente.";

        if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
          errorMessage = "Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:8000";
        } else if (error instanceof Error) {
          if (error.message.includes("timeout") || error.message.includes("Timeout")) {
            errorMessage = "A geração da história está demorando mais que o esperado. Por favor, aguarde ou tente novamente.";
          } else {
            errorMessage = `Erro: ${error.message}`;
          }
        }

        setStory("");
        setIssues([errorMessage]);

      } finally {

        if (abortControllerRef.current === abortController && !abortController.signal.aborted) {
          if (timeoutIdRef.current === timeoutId) {
            clearTimeout(timeoutId);
            timeoutIdRef.current = null;
          }
          setLoading(false);
          isFetchingRef.current = false;
          abortControllerRef.current = null;
        }
      }
    }

    fetchStory();

    /**
     * Cleanup ao desmontar ou alterar dependências
     */
    return () => {
      if (abortControllerRef.current === abortController) {
        cancelCurrentRequest();
      }
    };

  }, [storyData, storyId, backendUrl, isLoading, session?.token, session?.user_id, router]);

  /**
   * ============================================================
   * RENDERIZAÇÃO DA INTERFACE
   * ============================================================
   */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <AppHeader />

      <main className="flex-grow w-full max-w-7xl mx-auto p-6 md:p-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Sidebar com resumo e botão salvar */}
          <div className="lg:col-span-3 lg:sticky lg:top-24">
            <StorySidebar
              theme={storyData.theme}
              ageGroup={storyData.ageGroup}
              value={storyData.value}
              characters={storyData.characters}
              setting={storyData.setting}
              onSave={handleSaveStory}
              canSave={Boolean(story && !loading)}
              isSaving={isSaving}
              isSaved={isSaved}
            />
          </div>

          {/* Área principal da história */}
          <div className="lg:col-span-9">

            {/* Erro ao salvar */}
            {saveError && (
              <Alert
                type="error"
                title="Falha ao salvar"
                message={saveError}
                dismissible={false}
              />
            )}

            {/* Alertas de erro sem história */}
            {!loading && issues.length > 0 && !story && (
              <Alert
                type="error"
                title="Conteúdo Impróprio Detectado"
                message={issues.join("\n\n")}
                dismissible={false}
              />
            )}

            {/* Alertas de aviso com história */}
            {!loading && issues.length > 0 && story && 
             issues.some(issue => !issue.toLowerCase().includes("história não foi gerada") && 
                                  !issue.toLowerCase().includes("erro ao gerar história")) && (
              <Alert
                type="warning"
                title="Avisos"
                message={issues.filter(issue => 
                  !issue.toLowerCase().includes("história não foi gerada") &&
                  !issue.toLowerCase().includes("erro ao gerar história")
                ).join("\n\n")}
              />
            )}

            {/* Conteúdo da história */}
            <StoryContent 
              story={story} 
              loading={loading} 
              hasError={!loading && issues.length > 0 && !story}
              key={`${loading}-${story ? story.length : 0}`} 
            />

            {/* Botões de navegação pós-erro ou sucesso */}
            {!loading && issues.length > 0 && !story && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    sessionStorage.setItem("cancel_story_request", "true");
                    cancelCurrentRequest();
                    setTimeout(() => {
                      router.push("/create");
                    }, 100);
                  }}
                  className="bg-teal-400 hover:bg-teal-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-teal-100 transition-transform hover:scale-[1.01]"
                >
                  Voltar e Criar Nova História
                </button>
              </div>
            )}

            {story && !loading && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => {
                    sessionStorage.setItem("cancel_story_request", "true");
                    cancelCurrentRequest();
                    setTimeout(() => {
                      router.push("/create");
                    }, 100);
                  }}
                  className="bg-teal-400 hover:bg-teal-500 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-teal-100 transition-transform hover:scale-[1.01]"
                >
                  Criar Nova História
                </button>
              </div>
            )}

            {/* Aviso legal e exportação */}
            {story && (
              <>
                <Disclaimer />
                <ExportBar story={story} />
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

