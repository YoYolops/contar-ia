"use client";

/**
 * Contexto de Sessão da Aplicação
 * --------------------------------
 *
 * Este módulo é responsável por:
 * - Gerenciar a sessão do usuário no frontend
 * - Persistir dados da sessão no localStorage
 * - Sincronizar estado com o React Query
 * - Validar token com o backend
 * - Controlar logout (com ou sem motivo)
 *
 * Executa apenas no client-side (browser),
 * pois depende de localStorage e window.
 */
import { createContext, ReactNode, useCallback, useContext, useEffect } from "react";
import { UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Nome base utilizado para armazenar dados no localStorage.
 */
const APP_NAME = "contaria_app";

/**
 * Chave específica para armazenar o motivo do logout.
 */
const LOGOUT_REASON_KEY = `${APP_NAME}_logout_reason`;

/**
 * Estrutura de dados que representa a sessão autenticada do usuário.
 */
export interface SessionData {
  /**
   * Token JWT de autenticação.
   */
  token: string;

  /**
   * Identificador único do usuário.
   */
  user_id: string;

  /**
   * Nome de usuário exibido na aplicação.
   */
  username: string;

  /**
   * Email do usuário.
   */
  email: string;

  /**
   * Instituição associada ao usuário (opcional).
   */
  institution?: string | null;

  /**
   * Biografia ou descrição do usuário (opcional).
   */
  bio?: string | null;
}

/**
 * Tipo do contexto de sessão.
 * Estende o retorno do useQuery (React Query),
 * adicionando funções auxiliares de manipulação de sessão.
 */
type SessionContextType = UseQueryResult<SessionData | null, Error> & {
  /**
   * Realiza logout simples (sem motivo explícito).
   */
  logOut: () => void;

  /**
   * Realiza logout armazenando um motivo específico.
   */
  logOutWithReason: (reason: string) => void;

  /**
   * Atualiza parcialmente os dados da sessão.
   */
  updateSessionData: (novaSession: Partial<SessionData>) => void;

  /**
   * Substitui completamente os dados da sessão.
   */
  replaceSessionData: (novaSession: SessionData) => void;
};

/**
 * Recupera os dados da sessão armazenados no localStorage.
 * @param key Chave de armazenamento (padrão: APP_NAME)
 * @returns Dados da sessão ou null
 */
export async function getStorageData(key: string = APP_NAME): Promise<SessionData | null> {
  if (typeof window === "undefined") return null;
  const storagedData = localStorage.getItem(key);
  return storagedData ? JSON.parse(storagedData) : null;
}

/**
 * Persiste os dados da sessão no localStorage.
 * @param data Dados completos da sessão
 * @param key Chave de armazenamento
 */
export async function setStorageData(
  data: SessionData,
  key: string = APP_NAME
): Promise<void> {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Remove os dados de sessão do localStorage.
 * @param key Chave de armazenamento
 */
export async function clearStorageData(key: string = APP_NAME): Promise<void> {
  localStorage.removeItem(key);
}

/**
 * Armazena o motivo do logout no localStorage.
 * Usado para exibir mensagens ao usuário após redirecionamento.
 */
export async function setLogoutReason(reason: string): Promise<void> {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOGOUT_REASON_KEY, reason);
}

/**
 * Recupera o motivo do logout armazenado.
 * @returns String com motivo ou null
 */
export async function getLogoutReason(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LOGOUT_REASON_KEY);
}

/**
 * Remove o motivo de logout do localStorage.
 */
export async function clearLogoutReason(): Promise<void> {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LOGOUT_REASON_KEY);
}

/**
 * Criação do contexto de sessão.
 * O valor padrão é undefined para forçar uso correto dentro do Provider.
 */
export const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Propriedades do Provider.
 */
interface Props {
  children: ReactNode;
}

/**
 * Provider responsável por:
 * - Inicializar sessão via React Query
 * - Sincronizar localStorage com estado global
 * - Validar token no backend
 * - Expor funções de controle de sessão
 */
export function SessionContextProvider({ children }: Props) {
  const queryClient = useQueryClient();

  /**
   * URL base do backend.
   * Pode ser configurada via variável de ambiente.
   */
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "https://8522-2001-12f0-9c1-664-44d4-121b-454a-d470.ngrok-free.app";

  /**
   * Query responsável por recuperar a sessão do localStorage.
   */
  const session = useQuery<SessionData | null, Error>({
    queryKey: ["sessions"],
    queryFn: () => getStorageData(),
  });

  /**
   * Logout padrão:
   * - Remove dados da sessão
   * - Limpa motivo
   * - Atualiza cache do React Query
   */
  const logOut = useCallback(() => {
    clearStorageData();
    clearLogoutReason();
    queryClient.setQueryData(["sessions"], null);
    queryClient.invalidateQueries({ queryKey: ["sessions"] });
  }, [queryClient]);

  /**
   * Logout com motivo:
   * - Armazena motivo
   * - Remove sessão
   * - Atualiza cache
   */
  const logOutWithReason = useCallback(
    (reason: string) => {
      setLogoutReason(reason);
      clearStorageData();
      queryClient.setQueryData(["sessions"], null);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    [queryClient]
  );

  /**
   * Atualiza parcialmente os dados da sessão.
   * Mescla os dados atuais com os novos.
   */
  const updateSessionData = useCallback(
    (novaSession: Partial<SessionData>) => {
      const defaultSession: SessionData = {
        token: "",
        user_id: "",
        username: "",
        email: "",
        institution: null,
        bio: null,
      };

      const currentSession = queryClient.getQueryData<SessionData | null>(["sessions"]);

      const updatedData: SessionData = {
        ...(currentSession ?? defaultSession),
        ...novaSession,
      };

      setStorageData(updatedData);
      queryClient.setQueryData(["sessions"], updatedData);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    [queryClient]
  );

  /**
   * Substitui completamente os dados da sessão.
   */
  const replaceSessionData = useCallback(
    (novaSession: SessionData) => {
      setStorageData(novaSession);
      queryClient.setQueryData(["sessions"], novaSession);
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    [queryClient]
  );

  /**
   * Efeito responsável por validar o token com o backend.
   *
   * - Se o token for inválido → logout automático
   * - Se válido → atualiza dados da sessão
   *
   * Executa sempre que o token mudar.
   */
  useEffect(() => {
    const token = session.data?.token;
    if (!token) return;
    const controller = new AbortController();

    fetch(`${backendUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Unauthorized");
        }
        return res.json();
      })
      .then((data) => {
        updateSessionData({
          user_id: data.user_id,
          username: data.username,
          email: data.email,
          institution: data.institution ?? null,
          bio: data.bio ?? null,
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;

        /**
         * Caso o token seja inválido ou expirado,
         * força logout com mensagem amigável.
         */
        logOutWithReason("Sessao expirada. Faca login novamente.");
      });

    return () => {
      controller.abort();
    };
  }, [backendUrl, session.data?.token, updateSessionData, logOutWithReason]);

  /**
   * Disponibiliza estado e funções da sessão
   * para toda a aplicação.
   */
  return (
    <SessionContext.Provider
      value={{
        ...session,
        logOut,
        logOutWithReason,
        updateSessionData,
        replaceSessionData,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto de sessão.
 * Garante que seja utilizado dentro do SessionContextProvider.
 */
export function useSession() {
  const context = useContext(SessionContext);

  if (context === undefined) {
    throw new Error(
      "useSession deve ser usado dentro de um SessionContextProvider"
    );
  }

  return context;
}

/**
 * Export default para facilitar importações.
 */
export default SessionContext;
