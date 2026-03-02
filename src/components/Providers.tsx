"use client";

/**
 * Providers Globais da Aplicação
 * --------------------------------
 *
 * Este componente centraliza todos os providers globais
 * necessários para o funcionamento da aplicação.
 *
 * Responsabilidades:
 * - Inicializar e configurar o React Query
 * - Disponibilizar o contexto de sessão
 * - Disponibilizar o contexto de dados da história
 *
 * Ele deve envolver a aplicação (geralmente no layout raiz).
 */
import { useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionContextProvider } from "@/contexts/SessionContext";
import { StoryProvider } from "@/contexts/StoryContext";

/**
 * Propriedades aceitas pelo componente Providers.
 */
interface ProvidersProps {
  /**
   * Componentes filhos que terão acesso aos contextos globais.
   */
  children: ReactNode;
}

/**
 * Componente responsável por compor todos os Providers
 * necessários para o funcionamento global da aplicação.
 *
 * Estrutura hierárquica:
 *
 * QueryClientProvider
 *   └── SessionContextProvider
 *         └── StoryProvider
 *               └── children
 *
 * Ordem importante:
 * - React Query deve estar no topo, pois outros contextos
 *   dependem dele (ex: SessionContext usa useQuery).
 */
export default function Providers({ children }: ProvidersProps) {
  /**
   * Instância única do QueryClient.
   * useState com função inicializadora garante que
   * o QueryClient seja criado apenas uma vez.
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        /**
         * Configurações padrão aplicadas a todas as queries.
         */
        defaultOptions: {
          queries: {
            /**
             * Tempo (em ms) que os dados permanecem "fresh"
             * antes de serem considerados stale.
             * Aqui: 60 segundos.
             */
            staleTime: 60 * 1000,

            /**
             * Número de tentativas automáticas em caso de erro.
             */
            retry: 1,
          },
        },
      })
  );

  /**
   * Encadeamento dos Providers globais.
   * Todos os componentes filhos terão acesso a:
   * - Cache e gerenciamento de estado do React Query
   * - Dados de sessão autenticada
   * - Dados da história em construção
   */
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider>
        <StoryProvider>
          {children}
        </StoryProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}
