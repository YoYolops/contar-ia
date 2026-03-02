"use client";

/**
 * Página de Login da aplicação.
 *
 * Responsabilidades desta página:
 *
 * • Autenticar o usuário via API backend
 * • Gerenciar estado do formulário de login (email/usuário e senha)
 * • Controlar requisição assíncrona com timeout
 * • Persistir dados da sessão após autenticação bem-sucedida
 * • Exibir mensagens de erro e feedback visual ao usuário
 * • Exibir motivo de logout anterior (ex: sessão expirada)
 * • Garantir que qualquer sessão anterior seja limpa ao acessar a página
 * • Redirecionar para a área autenticada após login
 *
 * Integração principal:
 * • Contexto global de sessão (SessionContext)
 * • TanStack React Query para controle de mutação
 * • Next.js Router para navegação programática
 */
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { User, Lock, LogIn, Loader2 } from "lucide-react";
import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  useSession,
  getLogoutReason,
  clearLogoutReason,
} from "@/contexts/SessionContext";
import { Navbar } from "@/components/Navbar";

export default function LoginPage() {
  /**
   * Hook de navegação do Next.js.
   * Usado para redirecionamento após login.
   */
  const router = useRouter();

  /**
   * URL base do backend.
   * Usa variável de ambiente ou fallback local.
   */
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "https://8522-2001-12f0-9c1-664-44d4-121b-454a-d470.ngrok-free.app";

  /**
   * Tempo máximo de espera da requisição de login (ms).
   * Caso ultrapasse, a requisição será abortada.
   */
  const requestTimeoutMs = 10000;

  /**
   * Contexto global de sessão.
   * replaceSessionData → salva nova sessão após login
   * logOut → limpa qualquer sessão existente
   */
  const { replaceSessionData, logOut } = useSession();

  /**
   * Motivo do logout anterior (se houver).
   * Exemplo: sessão expirada, token inválido, etc.
   */
  const [logoutReason, setLogoutReason] = useState<string | null>(null);

  /**
   * Ref usado para garantir que o reset da sessão
   * aconteça apenas uma vez.
   */
  const didResetSession = useRef(false);

  /**
   * Estado controlado do formulário de login.
   */
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  /**
   * Mutação responsável por executar o login.
   *
   * Fluxo:
   * 1. Cria AbortController para timeout
   * 2. Envia requisição POST para /auth/login/
   * 3. Trata erros de rede e resposta inválida
   * 4. Retorna dados do usuário autenticado
   */
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async () => {
      const controller = new AbortController();

      // Cancela requisição se exceder o tempo limite
      const timeoutId = setTimeout(() => controller.abort(), requestTimeoutMs);

      try {
        const response = await fetch(`${backendUrl}/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Falha ao entrar. Verifique suas credenciais.",
          );
        }

        return data;
      } catch (err) {
        // Timeout ou cancelamento da requisição
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error("Servidor demorou para responder. Tente novamente.");
        }
        throw err;
      } finally {
        clearTimeout(timeoutId);
      }
    },

    /**
     * Executado após login bem-sucedido.
     * Salva os dados da sessão globalmente
     * e redireciona para a área autenticada.
     */
    onSuccess: (data) => {
      replaceSessionData({
        token: data.token,
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        institution: data.institution ?? null,
        bio: data.bio ?? null,
      });

      router.push("/create");
    },
  });

  /**
   * Handler de submissão do formulário.
   * Impede recarregamento da página e executa a mutação.
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate();
  };

  /**
   * Efeito responsável por limpar qualquer sessão anterior
   * e exibir motivo do logout (se existir).
   * Executa apenas uma vez graças ao useRef.
   */
  useEffect(() => {
    if (didResetSession.current) return;
    didResetSession.current = true;

    getLogoutReason().then((reason) => {
      // Garante que nenhuma sessão anterior permaneça ativa
      logOut();

      // Exibe mensagem ao usuário, se houver
      if (reason) {
        setLogoutReason(reason);
        clearLogoutReason();
      }
    });
  }, [logOut]);

  /**
   * Renderização da interface da página.
   *
   * Estrutura:
   * • Header
   * • Card central com formulário de login
   * • Mensagens de erro e logout
   * • Link para cadastro
   * • Footer
   */
  return (
    <div
      className="
            min-h-screen          /* Garante altura mínima igual à viewport */
            flex flex-col         /* Layout vertical */
            bg-gradient-to-b      /* Gradiente vertical de fundo */
            from-white to-slate-50
            font-sans             /* Fonte padrão sem serifa */
          "
    >
      {/* ================= Barra de navegação superior ================= */}
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-4 w-full">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              Bem-vindo(a)!
            </h1>
            <p className="text-slate-500">Vamos continuar a aventura.</p>
          </div>

          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50">
            {logoutReason && (
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm font-medium rounded-r-lg">
                {logoutReason}
              </div>
            )}

            {/* Alerta de Erro */}
            {isError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg animate-in fade-in zoom-in">
                {(error as Error).message}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  E-mail ou Usuário
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    required
                    type="text"
                    placeholder="Seu e-mail ou usuário"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all placeholder:text-slate-400 text-slate-700"
                    onChange={(e) =>
                      setLoginData((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Senha
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all placeholder:text-slate-400 text-slate-700"
                    onChange={(e) =>
                      setLoginData((p) => ({ ...p, password: e.target.value }))
                    }
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg mt-2"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <LogIn size={22} />
                    Entrar
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              Não tem uma conta?{" "}
              <Link
                href="/register"
                className="text-teal-600 hover:text-teal-700 font-bold hover:underline"
              >
                Fazer cadastro
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
