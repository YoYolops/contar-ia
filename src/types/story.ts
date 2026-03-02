/**
 * Conjunto de interfaces que definem os contratos de dados
 * utilizados no fluxo de geração, recuperação e estatísticas
 * de histórias na aplicação.
 *
 * Essas interfaces são tipicamente usadas para:
 * - Comunicação com a API (requests e responses)
 * - Tipagem de dados no frontend (TypeScript)
 * - Garantia de consistência entre backend e frontend
 */

/**
 * Representa a requisição enviada para gerar uma nova história.
 *
 * Contém as informações fornecidas pelo usuário que servirão
 * como parâmetros para o modelo de geração de conteúdo.
 */
export interface StoryGenerationRequest {
  /**
   * Tema principal da história.
   */
  theme: string;

  /**
   * Faixa etária do público-alvo.
   */
  age_group: string;

  /**
   * Valor educacional desejado na narrativa.
   */
  educational_value: string;

  /**
   * Ambiente ou cenário onde a história ocorre.
   */
  setting: string;

  /**
   * Lista de personagens principais da história.
   */
  characters: string[];

  /**
   * Título opcional definido pelo usuário.
   * Caso não seja fornecido, pode ser gerado automaticamente.
   */
  title?: string;

  /**
   * Identificador opcional do criador da história.
   * Usado para associar a história a um usuário no sistema.
   */
  creator_id?: string;
}

/**
 * Representa a resposta da API após tentar gerar uma história.
 *
 * Pode conter o conteúdo gerado, mensagens de problema
 * ou identificadores para persistência futura.
 */
export interface StoryGenerationResponse {
  /**
   * História gerada em formato Markdown.
   *
   * Pode ser null caso a geração falhe ou seja bloqueada
   * por validações de segurança.
   */
  story_markdown: string | null;

  /**
   * Lista de problemas, avisos ou validações detectadas
   * durante o processo de geração.
   *
   * Exemplo:
   * - Conteúdo potencialmente sensível
   * - Falta de parâmetros obrigatórios
   * - Erros internos do pipeline
   */
  issues: string[];

  /**
   * Identificador da história gerada, caso tenha sido
   * persistida no banco de dados.
   *
   * Pode ser null ou indefinido se a história não foi salva.
   */
  story_id?: string | null;
}

/**
 * Representa um item resumido de história em uma listagem.
 */
export interface StoryListItem {
  /**
   * Identificador único da história.
   */
  id: string;

  /**
   * Identificador do usuário criador da história.
   */
  creator_id: string;

  /**
   * Título da história.
   */
  title: string;

  /**
   * Conteúdo completo da história.
   * Dependendo do contexto, pode estar truncado no backend.
   */
  contents: string;

  /**
   * Data e hora de criação da história (ISO string).
   */
  created_at: string;
}

/**
 * Representa a resposta detalhada de uma história específica.
 *
 * Usado quando o usuário abre ou consulta uma história individual.
 * Possui estrutura semelhante ao item de lista, mas semanticamente
 * representa uma entidade completa.
 */
export interface StoryDetailResponse {
  /**
   * Identificador único da história.
   */
  id: string;

  /**
   * Identificador do usuário criador.
   */
  creator_id: string;

  /**
   * Título da história.
   */
  title: string;

  /**
   * Conteúdo completo da história.
   */
  contents: string;

  /**
   * Data e hora de criação (ISO string).
   */
  created_at: string;
}

/**
 * Representa estatísticas agregadas relacionadas às histórias
 * do usuário ou do sistema.
 *
 * Pode ser utilizado em dashboards ou painéis administrativos.
 */
export interface StoryStatsResponse {
  /**
   * Número total de histórias criadas.
   */
  created_count: number;

  /**
   * Número total de leituras ou visualizações.
   */
  reads_count: number;

  /**
   * Número total de histórias salvas ou favoritas.
   */
  saved_count: number;
}
