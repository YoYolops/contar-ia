"use client";

/**
 * Página de criação de histórias infantis.
 *
 * Responsável por coletar todos os parâmetros necessários para a geração
 * de uma história personalizada por IA, incluindo:
 *
 * • Tema da história (pré-definido ou customizado)
 * • Faixa etária do público-alvo
 * • Valor educacional principal
 * • Cenário onde a história se passa
 * • Personagens principais
 *
 * Fluxo principal:
 * 1. Usuário preenche os dados do formulário
 * 2. Um prompt estruturado é gerado com base nas escolhas
 * 3. Dados são salvos temporariamente (sessionStorage + Context)
 * 4. Usuário é redirecionado para a página de geração/exibição da história
 */
import { useEffect, useState } from "react";
import { Shield, Users, Heart, Sparkles, Edit3 } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { ThemeSelector } from "@/components/create/ThemeSelector";
import { StorySidebar } from "@/components/create/StorySidebar";
import { StoryDetails } from "@/components/create/StoryDetails";
import { useRouter } from "next/navigation";
import { useStory } from "@/contexts/StoryContext";
import { useSession } from "@/contexts/SessionContext";

export default function CreateStory() {
  /**
   * =========================
   * Estados de Tema
   * =========================
   */

  // Tema selecionado (pré-definido)
  const [theme, setTheme] = useState("Aventura");

  // Tema digitado pelo usuário quando seleciona "OUTRO"
  const [customTheme, setCustomTheme] = useState("");

  // Flag indicando uso de tema customizado
  const [isCustomTheme, setIsCustomTheme] = useState(false);

  /**
   * =========================
   * Faixa Etária
   * =========================
   */

  // Valor do slider (0–100) representando a idade
  const [ageGroup, setAgeGroup] = useState(50);

  /**
   * =========================
   * Valor Educacional
   * =========================
   */

  // Valor selecionado (pré-definido)
  const [value, setValue] = useState("Honestidade");

  // Valor educacional customizado
  const [customValue, setCustomValue] = useState("");

  // Flag indicando uso de valor customizado
  const [isCustomValue, setIsCustomValue] = useState(false);

  /**
   * =========================
   * Detalhes da História
   * =========================
   */

  // Cenário onde a história se passa
  const [setting, setSetting] = useState("");

  // Lista de personagens principais
  const [characters, setCharacters] = useState([
    "Um cavaleiro corajoso",
    "Um esquilo falante",
  ]);

  /**
   * =========================
   * Contextos e Navegação
   * =========================
   */

  // Contexto global da história (usado na página de geração)
  const { setStory } = useStory();

  // Router do Next.js para navegação programática
  const router = useRouter();

  // Contexto de sessão/autenticação
  const { data: session, isLoading } = useSession();

  /**
   * Verifica autenticação do usuário.
   * Se não houver token válido, redireciona para login.
   */
  useEffect(() => {
    if (!isLoading && !session?.token) {
      router.push("/login");
    }
  }, [isLoading, session?.token, router]);

  /**
   * Converte o valor do slider (0–100) em uma faixa etária textual.
   */
  const getAgeLabel = (val: number) => {
    if (val < 33) return "3-5 anos";
    if (val < 66) return "6-8 anos";
    return "9-12 anos";
  };

  /**
   * Função principal de criação da história.
   *
   * Responsabilidades:
   * • Consolidar valores escolhidos
   * • Gerar prompt estruturado para IA
   * • Salvar dados temporários
   * • Atualizar contexto global
   * • Redirecionar para a página de geração
   */
  async function handleCreateStory() {
    // Define tema final (customizado ou padrão)
    const finalTheme = isCustomTheme ? customTheme : theme;

    // Define valor educacional final
    const finalValue = isCustomValue ? customValue : value;

    /**
     * Prompt estruturado que será usado pela IA
     * para gerar a história infantil.
     */
    const prompt = `
    Crie uma história infantil com:

    Tema: ${finalTheme}
    Faixa etária: ${getAgeLabel(ageGroup)}
    Valor educativo: ${finalValue}
    Cenário: ${setting}
    Personagens: ${characters.join(", ")}
    `;

    // Salva prompt para uso posterior na página de história
    sessionStorage.setItem("pending_prompt", prompt);

    /**
     * Sinaliza cancelamento de requisições anteriores,
     * evitando conflitos entre múltiplas gerações.
     */
    sessionStorage.setItem("cancel_story_request", "true");

    /**
     * Salva dados estruturados no contexto global
     * para uso na próxima página.
     */
    setStory({
      theme: finalTheme,
      ageGroup,
      value: finalValue,
      setting,
      characters,
    });

    // Redireciona para a página onde a história será gerada/exibida
    router.push("/story");
  }

  /**
   * =========================
   * Renderização da Página
   * =========================
   */
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Cabeçalho da aplicação */}
      <AppHeader />

      {/* Conteúdo principal */}
      <main className="flex-grow w-full max-w-6xl mx-auto p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* =========================
              COLUNA PRINCIPAL (FORMULÁRIO)
              ========================= */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Introdução */}
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">
                Vamos criar uma história mágica
              </h1>
              <p className="text-slate-500 mb-6">
                Preencha os detalhes abaixo e deixe a nossa IA dar vida às suas
                ideias.
              </p>
            </div>

            {/* =========================
                Seleção de Tema
                ========================= */}
            <section>
              <h3 className="text-lg font-bold mb-4">Escolha um Tema</h3>

              <ThemeSelector
                selectedTheme={isCustomTheme ? "OUTRO" : theme}
                onSelect={(t) => {
                  if (t === "OUTRO") {
                    // Ativa modo customizado
                    setIsCustomTheme(true);
                    setTheme("");
                  } else {
                    // Usa tema padrão
                    setIsCustomTheme(false);
                    setTheme(t);
                    setCustomTheme("");
                  }
                }}
              />

              {/* Campo de texto exibido apenas se tema customizado */}
              {isCustomTheme && (
                <input
                  type="text"
                  placeholder="Digite o tema da história..."
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="mt-4 w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm outline-none focus:ring-2 focus:ring-teal-400"
                />
              )}
            </section>

            {/* =========================
                Faixa Etária
                ========================= */}
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                Selecione a Faixa Etária
                <span className="text-slate-400 text-sm font-normal"></span>
              </h3>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                
                {/* Slider de idade */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-400"
                />

                {/* Labels das faixas etárias */}
                <div className="flex justify-between mt-3 text-sm text-slate-500 font-medium">
                  <span className={ageGroup < 33 ? "text-teal-600 font-bold" : ""}>
                    3-5 anos
                  </span>
                  <span
                    className={
                      ageGroup >= 33 && ageGroup < 66
                        ? "text-teal-600 font-bold"
                        : ""
                    }
                  >
                    6-8 anos
                  </span>
                  <span className={ageGroup >= 66 ? "text-teal-600 font-bold" : ""}>
                    9-12 anos
                  </span>
                </div>
              </div>
            </section>

            {/* =========================
                Valor Educacional
                ========================= */}
            <section>
              <h3 className="text-lg font-bold mb-4">
                Escolha um Valor Educacional
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: "Honestidade", icon: Shield, color: "text-yellow-500" },
                  { id: "Trabalho em Equipe", icon: Users, color: "text-blue-500" },
                  { id: "Bondade", icon: Heart, color: "text-pink-500" },
                  { id: "OUTRO", icon: Edit3, color: "text-slate-600" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "OUTRO") {
                        setIsCustomValue(true);
                        setValue("");
                      } else {
                        setIsCustomValue(false);
                        setValue(item.id);
                        setCustomValue("");
                      }
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      (!isCustomValue && value === item.id) ||
                      (isCustomValue && item.id === "OUTRO")
                        ? "bg-white border-teal-400 shadow-md"
                        : "bg-white border-transparent hover:border-slate-200"
                    }`}
                  >
                    <item.icon className={`mb-2 ${item.color}`} size={28} />
                    <span className="font-semibold text-slate-700 text-center text-sm">
                      {item.id}
                    </span>
                  </button>
                ))}
              </div>

              {/* Campo de texto para valor customizado */}
              {isCustomValue && (
                <input
                  type="text"
                  placeholder="Digite o valor educacional..."
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  className="mt-4 w-full bg-white border border-slate-200 rounded-xl p-4 shadow-sm outline-none focus:ring-2 focus:ring-teal-400"
                />
              )}
            </section>

            {/* Componentes de cenário e personagens */}
            <StoryDetails
              characters={characters}
              setting={setting}
              onSettingChange={setSetting}
              onCharactersChange={setCharacters}
            />
          </div>

          {/* =========================
              SIDEBAR (RESUMO + AÇÃO)
              ========================= */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* Resumo da história em tempo real */}
              <StorySidebar
                theme={isCustomTheme ? customTheme : theme}
                ageGroup={ageGroup}
                value={isCustomValue ? customValue : value}
                characters={characters}
                setting={setting}
              />

              {/* Botão de geração da história */}
              <button
                onClick={handleCreateStory}
                className="w-full bg-teal-400 hover:bg-teal-500 text-white text-lg font-bold py-4 rounded-full shadow-lg shadow-teal-100 transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
              >
                <Sparkles size={24} />
                Criar a Minha História!
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
