"use client";

/**
 * Página de Perfil do Usuário.
 *
 * Responsabilidades desta página:
 *
 * • Garantir que o usuário esteja autenticado (redireciona para /login caso não esteja)
 * • Buscar e exibir estatísticas de histórias do usuário
 * • Exibir informações do perfil (nome, email, instituição, bio)
 * • Permitir atualização dos dados do usuário via API protegida
 * • Sincronizar alterações com o contexto global de sessão
 * • Exibir feedback visual de erro e sucesso ao salvar alterações
 *
 * Esta página depende fortemente do contexto de sessão (useSession)
 * para obter token, dados do usuário e atualizar o estado global.
 */
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import {
  User,
  Mail,
  BookOpen,
  Star,
  Camera,
  Save,
  Loader2,
} from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { StoryStatsResponse } from "@/types/story";

export default function ProfilePage() {
  /**
   * Hook de navegação do Next.js
   * Utilizado para redirecionamento programático.
   */
  const router = useRouter();

  /**
   * Contexto global de sessão.
   * data: contém token e dados do usuário logado
   * isLoading: indica se a sessão ainda está sendo carregada
   * updateSessionData: atualiza dados globais após edição do perfil
   */
  const { data: session, isLoading, updateSessionData } = useSession();

  /**
   * URL base do backend.
   * Usa variável de ambiente ou fallback para localhost.
   */
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://8522-2001-12f0-9c1-664-44d4-121b-454a-d470.ngrok-free.app";

  /**
   * Estado responsável por armazenar estatísticas do usuário.
   * created_count → histórias criadas
   * reads_count   → total de leituras
   * saved_count   → histórias salvas
   */
  const [stats, setStats] = useState<StoryStatsResponse>({
    created_count: 0,
    reads_count: 0,
    saved_count: 0,
  });

  /**
   * Estados controlados do formulário de edição de perfil.
   * Inicializados com os valores da sessão (se disponíveis).
   */
  const [name, setName] = useState(session?.username ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [school, setSchool] = useState(session?.institution ?? "");
  const [bio, setBio] = useState(session?.bio ?? "");

  /**
   * Estados auxiliares de controle de salvamento.
   */
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  /**
   * Efeito responsável por proteger a rota.
   * Se a sessão terminou de carregar e não existe token,
   * redireciona o usuário para a tela de login.
   */
  useEffect(() => {
    if (!isLoading && !session?.token) {
      router.push("/login");
    }
  }, [isLoading, session?.token, router]);

  /**
   * Efeito responsável por buscar as estatísticas do usuário.
   * Executa apenas quando user_id estiver disponível.
   * Caso ocorra erro na requisição, define valores padrão (0).
   */
  useEffect(() => {
    if (!session?.user_id) return;

    fetch(`${backendUrl}/stories/stats/${session.user_id}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.detail || `HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setStats(data))
      .catch(() =>
        setStats({ created_count: 0, reads_count: 0, saved_count: 0 })
      );
  }, [backendUrl, session?.user_id]);

  /**
   * Sempre que os dados da sessão mudarem,
   * sincronizamos os estados locais do formulário.
   * Isso evita inconsistência entre contexto global e UI.
   */
  useEffect(() => {
    setName(session?.username ?? "");
    setEmail(session?.email ?? "");
    setSchool(session?.institution ?? "");
    setBio(session?.bio ?? "");
  }, [
    session?.username,
    session?.email,
    session?.institution,
    session?.bio,
  ]);

  /**
   * Handler responsável por salvar alterações do perfil.
   *
   * Fluxo:
   * 1. Impede comportamento padrão do formulário
   * 2. Valida sessão
   * 3. Valida campos obrigatórios
   * 4. Envia requisição PUT autenticada
   * 5. Atualiza estados locais
   * 6. Atualiza contexto global
   * 7. Exibe feedback visual
   */
  const handleSaveProfile = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSaveError(null);
    setSaveSuccess(null);

    // Validação de sessão
    if (!session?.token) {
      setSaveError("Sessão inválida. Façaa login novamente.");
      return;
    }

    // Validação básica de campos obrigatórios
    if (!name.trim() || !email.trim()) {
      setSaveError("Nome e email são obrigatórios.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`${backendUrl}/auth/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.token}`, // Autenticação JWT
        },
        body: JSON.stringify({
          username: name,
          email,
          institution: school,
          bio,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || "Não foi possível salvar as alterações."
        );
      }

      /**
       * Atualiza estados locais com retorno do backend
       */
      setName(data.username ?? "");
      setEmail(data.email ?? "");
      setSchool(data.institution ?? "");
      setBio(data.bio ?? "");

      /**
       * Atualiza o contexto global de sessão
       * para manter consistência em toda aplicação.
       */
      updateSessionData({
        username: data.username,
        email: data.email,
        institution: data.institution ?? null,
        bio: data.bio ?? null,
      });

      setSaveSuccess("Alterações salvas com sucesso.");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao salvar perfil."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Renderização principal da página.
   *
   * Estrutura:
   * • AppHeader
   * • Card lateral com avatar e navegação
   * • Estatísticas do usuário
   * • Formulário de edição
   */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <AppHeader />

      <main className="flex-grow w-full max-w-6xl mx-auto p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">Meu Perfil</h1>
          <p className="text-slate-500">Gerencie suas informações e veja seu progresso.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-400 to-green-400"></div>

              <div className="relative mt-8 mb-4">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
                  <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                    <User size={48} />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-colors shadow-sm border-2 border-white">
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-slate-800">{name}</h2>
              <p className="text-sm text-slate-500 font-medium mb-4">Educador(a)</p>

              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold flex items-center gap-1">
                  <Star size={12} fill="currentColor" /> Top Criador(a)
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <nav className="flex flex-col">
                <button className="flex items-center gap-3 px-6 py-4 bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-500">
                  <User size={18} /> Dados Pessoais
                </button>

                {/**
                 * Funcionalidades futuras - mantidas no código para referência visual
                 * e possível implementação posterior:
                 *
                <button className="flex items-center gap-3 px-6 py-4 text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                  <Lock size={18} /> Senha e Seguranca
                </button>
                <button className="flex items-center gap-3 px-6 py-4 text-slate-600 hover:bg-slate-50 transition-colors font-medium">
                  <Settings size={18} /> Preferencias
                </button>
                */}

              </nav>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.created_count}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">Histórias</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                  <Star size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.reads_count}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">Leituras</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                  <Save size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{stats.saved_count}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase">Salvas</p>
                </div>
              </div>
            </section>

            <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800">Informações da Conta</h3>
              </div>

              {saveError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {saveSuccess}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSaveProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-400 transition-all text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Instituição</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-400 transition-all text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700">Endereço de Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-teal-400 transition-all text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700">Biografia Curta</label>
                    <textarea
                      rows={4}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Conte um pouco sobre você..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-teal-400 transition-all text-slate-700 resize-none"
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-green-100 transition-transform active:scale-95 flex items-center gap-2"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Salvar alterações
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
