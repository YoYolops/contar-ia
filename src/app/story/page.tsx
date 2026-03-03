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
  // 1. Travas de segurança essenciais
  if (isLoading) return;
  if (!session?.token) {
    router.push("/login");
    return;
  }

  // 2. Lógica para buscar história EXISTENTE
  if (storyId) {
    let ignore = false;
    const controller = new AbortController();
    
    setLoading(true);
    setIssues([]);
    setIsSaved(true);

    fetch(`${backendUrl}/stories/by-id/${storyId}?user_id=${session?.user_id ?? ""}`, {
      method: "GET",
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!ignore) setStory(data.contents || "");
      })
      .catch((err) => {
        if (!ignore && err.name !== "AbortError") {
          setStory("");
          setIssues([err.message || "Erro ao carregar a história."]);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }

  // 3. Lógica para GERAR NOVA história
  const shouldCancel = sessionStorage.getItem("cancel_story_request");
  if (shouldCancel === "true") {
    sessionStorage.removeItem("cancel_story_request");
    setLoading(false);
    return;
  }

  // Validação dos dados do contexto
  if (!storyData.theme || !storyData.value) {
    const checkDataTimeout = setTimeout(() => {
      setLoading(false);
      setStory("Dados da história não encontrados. Por favor, crie uma nova história.");
    }, 500);
    return () => clearTimeout(checkDataTimeout);
  }

  // Chave única para evitar repetição da mesma história
  const currentStoryKey = JSON.stringify({
    theme: storyData.theme,
    value: storyData.value,
    ageGroup: storyData.ageGroup,
    setting: storyData.setting,
    characters: [...(storyData.characters || [])].sort()
  });

  // Se a chave for igual à última, já tentamos gerar essa história. Não faça nada.
  if (lastStoryKeyRef.current === currentStoryKey) {
    return; 
  }

  // Marca que estamos começando a gerar esta história específica
  lastStoryKeyRef.current = currentStoryKey;
  
  // Padrão React para evitar race conditions
  let ignore = false;
  const abortController = new AbortController();
  
  const timeoutId = setTimeout(() => {
    abortController.abort("TIMEOUT");
  }, 300000); // 5 minutos

  async function fetchStory() {
    setLoading(true);
    setIssues([]);
    
    try {
      const storyRequest = {
        theme: storyData.theme,
        age_group: getAgeLabel(storyData.ageGroup),
        educational_value: storyData.value,
        setting: storyData.setting,
        characters: storyData.characters,
        title: storyData.theme,
        creator_id: session?.user_id,
      };

      const res = await fetch(`${backendUrl}/stories/generate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.token}`
        },
        body: JSON.stringify(storyRequest),
        signal: abortController.signal,
      });

      if (ignore) return;
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      if (ignore) return;

      if (data.story_markdown && data.story_markdown.trim().length > 0) {
        const relevantIssues = (data.issues || []).filter((issue: any) => {
          const issueLower = issue.toLowerCase();
          return !issueLower.includes("história não foi gerada") &&
                 !issueLower.includes("erro") &&
                 !issueLower.includes("conteúdo");
        });
        setIssues(relevantIssues);
        setStory(data.story_markdown);
      } else {
        setIssues(data.issues && data.issues.length > 0 ? data.issues : ["Não foi possível gerar a história."]);
        setStory("");
      }

    } catch (error: any) {
      if (ignore || error.name === "AbortError") return;

      let errorMessage = "Erro ao gerar a história. Por favor, tente novamente.";
      if (error === "TIMEOUT" || error.message?.includes("Timeout")) {
        errorMessage = "A geração demorou mais que o esperado. Tente novamente.";
      } else if (error instanceof TypeError) {
        errorMessage = "Não foi possível conectar ao servidor.";
      }
      setIssues([errorMessage]);
      setStory("");
      
      // Se falhou, limpamos a ref para permitir que o usuário tente de novo clicando no botão
      lastStoryKeyRef.current = ""; 

    } finally {
      clearTimeout(timeoutId);
      if (!ignore) setLoading(false);
    }
  }

  fetchStory();

  // Função de limpeza simplificada
  return () => {
    ignore = true;
    clearTimeout(timeoutId);
    abortController.abort();
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

