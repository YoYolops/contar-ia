"use client";

/**
 * ============================================================
 * PÁGINA: MINHA BIBLIOTECA (StoriesPage)
 * ============================================================
 *
 * Responsabilidades:
 * • Garantir que o usuário esteja autenticado
 * • Buscar histórias salvas do usuário no backend
 * • Permitir busca por título (normalizada, sem acentos)
 * • Exibir histórias em formato de cards responsivos
 * • Permitir visualizar e excluir histórias
 * • Controlar estados de loading, erro e exclusão
 *
 * Observações:
 * • Client Component (usa hooks e estado)
 * • Requer sessão válida para acesso
 * • Usa useMemo para otimizar filtragem
 */
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { useSession } from "@/contexts/SessionContext";
import { Search, Plus, Calendar, Trash2, Eye, BookOpen, Edit3 } from "lucide-react";
import { StoryListItem } from "@/types/story";

/**
 * Paletas de cores usadas para os cards de história.
 * Alternadas dinamicamente para gerar variação visual.
 */
const STORY_CARD_COLORS = [
  { bgGradient: "from-blue-200 to-slate-200" },
  { bgGradient: "from-orange-200 to-yellow-100" },
  { bgGradient: "from-purple-200 to-slate-200" },
  { bgGradient: "from-pink-200 to-rose-100" },
];

/**
 * Extrai o título principal (# Heading) do markdown da história.
 */
function extractMarkdownTitle(contents?: string): string | null {
  if (!contents) return null;
  const match = contents.match(/^\s*#\s+(.+)$/m);
  if (!match?.[1]) return null;
  return match[1].trim();
}

/**
 * Remove o título markdown do conteúdo para gerar preview.
 */
function getPreviewWithoutTitle(contents?: string): string {
  if (!contents) return "História sem conteúdo.";
  const withoutHeading = contents.replace(/^\s*#\s+.+\r?\n?/m, "").trim();
  return withoutHeading || "História sem conteúdo.";
}

/**
 * Normaliza texto para busca:
 * • Remove acentos
 * • Converte para minúsculo
 * • Remove espaços extras
 */
function normalizeSearchText(value?: string): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export default function StoriesPage() {

  /**
   * ============================================================
   * CONTEXTOS E CONFIGURAÇÕES
   * ============================================================
   */
  const router = useRouter();
  const { data: session, isLoading } = useSession();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://8522-2001-12f0-9c1-664-44d4-121b-454a-d470.ngrok-free.app";

  /**
   * ============================================================
   * ESTADOS
   * ============================================================
   */
  const [searchTerm, setSearchTerm] = useState("");
  const [stories, setStories] = useState<StoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /**
   * ============================================================
   * REDIRECIONAMENTO SE NÃO AUTENTICADO
   * ============================================================
   */
  useEffect(() => {
    if (!isLoading && !session?.token) {
      router.push("/login");
    }
  }, [isLoading, session?.token, router]);

  /**
   * ============================================================
   * BUSCA DAS HISTÓRIAS SALVAS
   * ============================================================
   */
  useEffect(() => {
    if (!session?.user_id) return;

    setLoading(true);
    setError(null);

    fetch(`${backendUrl}/stories/saved/${session.user_id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || `HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setStories(data || []))
      .catch((err) => setError(err.message || "Erro ao carregar histórias."))
      .finally(() => setLoading(false));
  }, [backendUrl, session?.user_id]);

  /**
   * ============================================================
   * FILTRAGEM DAS HISTÓRIAS (useMemo)
   * ============================================================
   *
   * Evita recalcular a filtragem a cada render desnecessário.
   */
  const filteredStories = useMemo(() => {
    const term = normalizeSearchText(searchTerm);
    if (!term) return stories;

    return stories.filter((story) => {
      const storyTitle = extractMarkdownTitle(story.contents) || story.title || "";
      return normalizeSearchText(storyTitle).includes(term);
    });
  }, [stories, searchTerm]);

  /**
   * ============================================================
   * EXCLUSÃO DE HISTÓRIA
   * ============================================================
   */
  const handleDeleteStory = async (storyId: string) => {
    if (!session?.user_id || deletingId) return;

    const confirmed = window.confirm("Deseja remover esta história da sua biblioteca?");
    if (!confirmed) return;

    setDeletingId(storyId);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/stories/${storyId}?user_id=${session.user_id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Não foi possível remover a história.");
      }

      // Remove localmente após sucesso
      setStories((prev) => prev.filter((item) => item.id !== storyId));

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao remover história.";
      setError(message);
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * ============================================================
   * RENDERIZAÇÃO
   * ============================================================
   */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">

      {/* Cabeçalho principal da aplicação */}
      <AppHeader />

      <main className="flex-grow w-full max-w-7xl mx-auto p-6 md:p-10">

        {/* Título + Busca + Botão Criar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">

          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">
              Minha Biblioteca
            </h1>
            <p className="text-slate-500 mt-1">
              Guarde e revisite as suas histórias.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">

            {/* Campo de busca */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Pesquisar história..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 bg-white border border-slate-200 rounded-full py-3 pl-12 pr-6 outline-none focus:ring-2 focus:ring-teal-400 shadow-sm transition-all text-slate-700"
              />
            </div>

            {/* Botão Criar Nova História */}
            <Link
              href="/create"
              className="bg-teal-400 hover:bg-teal-500 text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-teal-100 transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden sm:inline">Criar Nova</span>
            </Link>
          </div>
        </div>

        {/* =========================
           Estados de tela
           ========================= */}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Search size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">
              Carregando histórias...
            </h3>
          </div>

        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-red-50 p-6 rounded-full mb-4">
              <Search size={48} className="text-red-300" />
            </div>
            <h3 className="text-xl font-bold text-red-700">
              Erro ao carregar
            </h3>
            <p className="text-slate-500">{error}</p>
          </div>

        ) : filteredStories.length > 0 ? (

          /**
           * ============================================================
           * GRID DE CARDS DE HISTÓRIA
           * ============================================================
           */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {filteredStories.map((story, index) => {

              const palette = STORY_CARD_COLORS[index % STORY_CARD_COLORS.length];

              const createdAt = new Date(story.created_at);
              const dateLabel = isNaN(createdAt.getTime())
                ? "Data desconhecida"
                : createdAt.toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });

              const genreLabel = story.title?.trim() || "Sem gênero";
              const displayTitle =
                extractMarkdownTitle(story.contents) || "História sem título";
              const previewText = getPreviewWithoutTitle(story.contents);

              return (
                <div
                  key={story.id}
                  className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Área superior com gradiente */}
                  <div
                    className={`h-40 w-full bg-gradient-to-br ${palette.bgGradient} relative p-5 flex flex-col justify-between`}
                  >
                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-slate-700 border border-white/80">
                      <BookOpen size={14} />
                      {genreLabel}
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 leading-tight tracking-tight line-clamp-2">
                      {displayTitle}
                    </h3>
                  </div>

                  {/* Corpo do card */}
                  <div className="p-5 flex-grow flex flex-col">

                    <div className="flex items-center gap-1 text-xs text-slate-400 font-medium mb-3">
                      <Calendar size={12} />
                      {dateLabel}
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-3 mb-6">
                      {previewText.slice(0, 160)}
                    </p>

                    {/* Ações */}
                    <div className="mt-auto flex items-center gap-2 pt-4 border-t border-slate-50">

                      <Link
                        href={`/story?id=${story.id}`}
                        className="flex-grow bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-600 border border-slate-200 hover:border-teal-200 rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-bold transition-all"
                      >
                        <Eye size={16} /> Ler
                      </Link>

                      <button
                        className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Editar"
                        onClick={() => window.alert("to be implemented")}
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Excluir"
                        onClick={() => handleDeleteStory(story.id)}
                        disabled={deletingId === story.id}
                      >
                        <Trash2 size={18} />
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <Search size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700">
              Nenhuma história encontrada
            </h3>
            <p className="text-slate-500">
              Tente pesquisar outro termo ou crie uma nova história.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
