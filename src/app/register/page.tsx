"use client";

/**
 * ============================================================
 * PÁGINA: CADASTRO DE USUÁRIO (RegisterPage)
 * ============================================================
 *
 * Responsabilidades:
 * • Permitir criação de nova conta de usuário
 * • Validar confirmação de senha no cliente
 * • Enviar dados ao backend via API /auth/register/
 * • Gerenciar estados de loading e erro com React Query
 * • Aplicar timeout de requisição para evitar travamentos
 * • Redirecionar para login após cadastro bem-sucedido
 *
 * Observações:
 * • Client Component (usa hooks e estado)
 * • Utiliza TanStack React Query para mutation
 * • Usa AbortController para cancelar requisições lentas
 */
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { User, Lock, RotateCw, UserPlus, Loader2, Mail } from "lucide-react";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { clearLogoutReason } from "@/contexts/SessionContext";
import { Navbar } from "@/components/Navbar";

export default function RegisterPage() {

  /**
   * ============================================================
   * CONFIGURAÇÕES E CONTEXTOS
   * ============================================================
   */
  const router = useRouter();

  /**
   * URL do backend (configurável por variável de ambiente).
   */
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://8522-2001-12f0-9c1-664-44d4-121b-454a-d470.ngrok-free.app";

  /**
   * Timeout máximo da requisição (ms).
   * Evita que o usuário fique preso esperando indefinidamente.
   */
  const requestTimeoutMs = 10000;

  /**
   * ============================================================
   * ESTADO DO FORMULÁRIO
   * ============================================================
   */
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    password: "",
    passConfirmation: "",
  });

  /**
   * ============================================================
   * MUTATION DE CADASTRO (React Query)
   * ============================================================
   *
   * Controla:
   * • Execução da requisição POST
   * • Estados de loading (isPending)
   * • Tratamento de erros (isError)
   * • Ação após sucesso (onSuccess)
   */
  const { mutate, isPending, error, isError } = useMutation({

    mutationFn: async () => {

      /**
       * Validação básica de senha no cliente.
       */
      if (userData.password !== userData.passConfirmation) {
        throw new Error("As senhas não coincidem.");
      }

      /**
       * Controlador para abortar requisição após timeout.
       */
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        requestTimeoutMs
      );

      try {
        const response = await fetch(`${backendUrl}/auth/register/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: userData.username,
            email: userData.email,
            password: userData.password,
          }),
          signal: controller.signal,
        });

        const data = await response.json();

        /**
         * Se resposta não for OK, lança erro retornado pelo backend.
         */
        if (!response.ok) {
          throw new Error(data.detail || "Erro no cadastro");
        }

        return data;

      } catch (err) {

        /**
         * Tratamento específico para timeout (AbortError).
         */
        if (err instanceof DOMException && err.name === "AbortError") {
          throw new Error(
            "Servidor demorou para responder. Tente novamente."
          );
        }

        throw err;

      } finally {
        clearTimeout(timeoutId);
      }
    },

    /**
     * Executado quando cadastro ocorre com sucesso.
     */
    onSuccess: () => {

      /**
       * Limpa possíveis motivos de logout armazenados.
       */
      clearLogoutReason();

      /**
       * Redireciona usuário para página de login.
       */
      router.push("/login");
    },
  });

  /**
   * ============================================================
   * SUBMISSÃO DO FORMULÁRIO
   * ============================================================
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate();
  };

  /**
   * ============================================================
   * RENDERIZAÇÃO
   * ============================================================
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

          {/* Título */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
              Crie a Sua Conta
            </h1>
            <p className="text-slate-500">
              Comece a sua aventura!
            </p>
          </div>

          {/* Card do formulário */}
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50">

            {/* Mensagem de erro (React Query) */}
            {isError && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium rounded-r-lg">
                {(error as Error).message}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>

              {/* =========================
                  Campo: Usuário
                  ========================= */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Usuário
                </label>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <User size={20} />
                  </div>

                  <input
                    required
                    type="text"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all"
                    onChange={(e) =>
                      setUserData((p) => ({
                        ...p,
                        username: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* =========================
                  Campo: Email
                  ========================= */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Email
                </label>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Mail size={20} />
                  </div>

                  <input
                    required
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all"
                    onChange={(e) =>
                      setUserData((p) => ({
                        ...p,
                        email: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* =========================
                  Campo: Senha
                  ========================= */}
              <div className="space-y-1">
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all"
                    onChange={(e) =>
                      setUserData((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* =========================
                  Campo: Confirmação
                  ========================= */}
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">
                  Confirmar
                </label>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <RotateCw size={20} />
                  </div>

                  <input
                    required
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-teal-400 focus:bg-white transition-all"
                    onChange={(e) =>
                      setUserData((p) => ({
                        ...p,
                        passConfirmation: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* =========================
                  Botão de envio
                  ========================= */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <>
                    <UserPlus size={22} /> Cadastrar
                  </>
                )}
              </button>
            </form>

            {/* Link para login */}
            <div className="mt-8 text-center text-sm font-medium text-slate-500">
              Já tem uma conta?{" "}
              <Link
                href="/login"
                className="text-teal-600 font-bold hover:underline"
              >
                Entrar
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Rodapé da aplicação */}
      <Footer />
    </div>
  );
}
