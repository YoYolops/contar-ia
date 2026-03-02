"use client";

/**
 * Contexto de Dados da História
 * ------------------------------
 *
 * Este módulo fornece um contexto React para armazenar e manipular
 * os dados de configuração de uma história em criação.
 *
 * Ele permite compartilhar informações entre múltiplos componentes,
 * como formulários em etapas (wizard), páginas diferentes ou
 * componentes aninhados, sem necessidade de prop drilling.
 *
 * Executa apenas no client-side.
 */
import { createContext, useContext, useState } from "react";

/**
 * Estrutura de dados que representa os parâmetros
 * necessários para gerar uma história.
 */
interface StoryData {
  /**
   * Tema principal da história.
   */
  theme: string;

  /**
   * Faixa etária alvo representada numericamente.
   */
  ageGroup: number;

  /**
   * Valor educacional da história.
   */
  value: string;

  /**
   * Cenário onde a história ocorre.
   */
  setting: string;

  /**
   * Lista de personagens principais.
   */
  characters: string[];
}

/**
 * Tipo do contexto que será exposto aos componentes consumidores.
 */
interface StoryContextType {
  /**
   * Dados atuais da história em construção.
   */
  story: StoryData;

  /**
   * Atualiza parcialmente os dados da história.
   * Permite modificar apenas campos específicos,
   * preservando os demais.
   */
  setStory: (data: Partial<StoryData>) => void;
}

/**
 * Criação do contexto da história.
 * Valor inicial é null para permitir validação
 * de uso correto dentro do Provider.
 */
const StoryContext = createContext<StoryContextType | null>(null);

/**
 * Provider responsável por armazenar o estado global
 * da história e disponibilizá-lo para os componentes filhos.
 * @param children Componentes que terão acesso ao contexto
 */
export function StoryProvider({ children }: { children: React.ReactNode }) {
  /**
   * Estado interno contendo os dados da história.
   * Inicializado com valores vazios.
   */
  const [story, setStoryState] = useState<StoryData>({
    theme: "",
    ageGroup: 0,
    value: "",
    setting: "",
    characters: [],
  });

  /**
   * Atualiza parcialmente o estado da história.
   * Combina os dados atuais com os novos valores fornecidos,
   * evitando a necessidade de sobrescrever o objeto inteiro.
   * @param data Campos a serem atualizados
   */
  function setStory(data: Partial<StoryData>) {
    setStoryState((prev) => ({ ...prev, ...data }));
  }

  /**
   * Fornece o estado e a função de atualização
   * para todos os componentes descendentes.
   */
  return (
    <StoryContext.Provider value={{ story, setStory }}>
      {children}
    </StoryContext.Provider>
  );
}

/**
 * Hook personalizado para acessar o contexto da história.
 * Garante que o hook seja utilizado dentro de um StoryProvider.
 * @throws Error se usado fora do Provider
 * @returns Objeto contendo os dados da história e função de atualização
 */
export function useStory() {
  const ctx = useContext(StoryContext);

  if (!ctx) {
    throw new Error("useStory must be used inside StoryProvider");
  }

  return ctx;
}
