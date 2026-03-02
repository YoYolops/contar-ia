"use client";

import Link from "next/link";
import { BookOpen, User, LogOut } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";

/**
 * Componente de cabeçalho principal da área autenticada.
 *
 * Renderiza um header fixo contendo:
 * - Identidade visual da aplicação (logo + nome)
 * - Navegação principal do usuário
 * - Saudação personalizada com nome da sessão
 * - Acesso ao perfil
 * - Ação de logout com redirecionamento
 *
 * Este componente depende do SessionContext para obter
 * informações do usuário autenticado.
 * @component
 * @returns Cabeçalho fixo exibido no topo da interface
 */
export function AppHeader() {
  /**
   * Hook de navegação programática do Next.js.
   * Permite redirecionar o usuário após logout.
   */
  const router = useRouter();

  /**
   * Recupera dados da sessão e função de logout
   * a partir do contexto global de autenticação.
   */
  const { data: session, logOut } = useSession();

  /**
   * Nome exibido na saudação ao usuário.
   * Caso o nome não esteja disponível na sessão,
   * utiliza um valor padrão.
   */
  const displayName = session?.username || "Professor(a)";

  /**
   * Manipulador de logout do usuário.
   * Executa:
   * 1. Limpeza da sessão através do contexto
   * 2. Redirecionamento para a página inicial
   */
  function handleLogout() {
    logOut();
    router.push("/");
  }

  return (
    <header className="w-full bg-white border-b border-slate-100 py-3 px-6 flex items-center justify-between sticky top-0 z-50">

      {/* Logo e link para a página inicial */}
      <Link 
        href="/" 
        className="flex items-center gap-2 font-bold text-xl text-slate-800 hover:opacity-80 transition-opacity"
      >
        <div className="bg-teal-100 p-1.5 rounded-lg text-teal-600">
          <BookOpen size={20} />
        </div>
        <span>Contar-IA</span>
      </Link>

      <div className="flex items-center gap-6">
        
        {/* Navegação principal (visível em telas médias ou maiores) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-500">
          <Link href="/create" className="text-teal-600 font-bold">
            Criar Nova
          </Link>
          <Link href="/stories" className="hover:text-teal-600 transition-colors">
            Minhas Histórias
          </Link>
        </nav>

        {/* Divisor visual entre navegação e área do usuário */}
        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Área de informações do usuário */}
        <div className="flex items-center gap-3 pl-2">

          {/* Saudação e botão de logout (ocultos em telas pequenas) */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-700 leading-none">
              Olá, {displayName}
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center justify-end gap-1 mt-1"
            >
              Sair <LogOut size={10} />
            </button>
          </div>

          {/* Avatar com acesso ao perfil */}
          <Link href="/profile">
            <div className="w-10 h-10 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center text-teal-700 font-bold cursor-pointer hover:bg-teal-200 transition-colors shadow-sm">
              <User size={20} />
            </div>
          </Link>

        </div>

      </div>
    </header>
  );
}
