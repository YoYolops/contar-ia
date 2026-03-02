"use client";

/**
 * Componente Navbar (Barra de Navegação)
 * --------------------------------------
 *
 * Barra superior principal da aplicação.
 * Responsabilidades:
 * - Exibir identidade da aplicação (logo + nome)
 * - Mostrar links de navegação principais
 * - Adaptar interface conforme estado de autenticação
 * - Permitir logout do usuário autenticado
 *
 * Comportamento condicional:
 * - Usuário logado → mostra Perfil + Sair
 * - Usuário não logado → mostra Entrar + Cadastrar
 */
import Link from "next/link";
import { BookOpen, LogOut, User } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { useRouter } from "next/navigation";

/**
 * Componente funcional da barra de navegação.
 */
export function Navbar() {
  /**
   * Hook de navegação programática do Next.js.
   */
  const router = useRouter();

  /**
   * Recupera dados da sessão e função de logout
   * a partir do contexto global.
   */
  const { data: session, logOut } = useSession();

  /**
   * Determina se o usuário está autenticado.
   */
  const isLoggedIn = Boolean(session?.token);

  /**
   * Manipulador de logout.
   * Fluxo:
   * 1. Limpa a sessão do usuário
   * 2. Redireciona para a página inicial
   */
  function handleLogout() {
    logOut();
    router.push("/");
  }

  return (
    /**
     * Container principal da navbar.
     * - Largura máxima controlada
     * - Centralizada horizontalmente
     * - Espaçamento interno consistente
     */
    <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
      
      {/* =========================================================
          LOGO + NOME DA APLICAÇÃO
         ========================================================= */}
      <Link 
        href="/" 
        className="flex items-center gap-2 font-bold text-xl text-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
      >
        {/* Ícone estilizado */}
        <div className="bg-teal-100 p-1.5 rounded-lg text-teal-600">
          <BookOpen size={24} />
        </div>

        {/* Nome da aplicação */}
        <span>Contar-IA</span>
      </Link>

      {/* =========================================================
          NAVEGAÇÃO PRINCIPAL
         ========================================================= */}
      <nav className="flex items-center gap-6 font-medium">
        
        {/* =====================================================
            ESTADO: USUÁRIO LOGADO
           ===================================================== */}
        {isLoggedIn ? (
          <>
            {/* Link para página de perfil */}
            <Link
              href="/profile"
              className="text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-2"
            >
              <User size={18} />

              {/* Exibe nome do usuário se disponível */}
              {session?.username || "Perfil"}
            </Link>

            {/* Botão de logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="text-slate-500 hover:text-red-500 transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              Sair
            </button>
          </>
        ) : (
          /* =====================================================
             ESTADO: USUÁRIO NÃO LOGADO
             ===================================================== */
          <>
            {/* Link para página de login */}
            <Link
              href="/login"
              className="text-slate-500 hover:text-teal-600 transition-colors"
            >
              Entrar
            </Link>

            {/* Link destacado para cadastro */}
            <Link
              href="/register"
              className="bg-teal-400 hover:bg-teal-500 text-white font-semibold py-2 px-6 rounded-full transition-colors shadow-sm shadow-teal-100"
            >
              Cadastrar
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
