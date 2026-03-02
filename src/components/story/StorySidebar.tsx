import { Shield, User, PlusCircle, Save, Users, Heart, Edit3 } from "lucide-react";
import Link from "next/link";

/**
 * Propriedades do componente StorySidebar.
 */
interface StorySidebarProps {
  /**
   * Tema selecionado para a história.
   */
  theme: string;

  /**
   * Valor numérico representando a faixa etária.
   * Utilizado para mapear para um rótulo textual.
   */
  ageGroup: number;

  /**
   * Valor educacional escolhido para a história.
   */
  value: string;

  /**
   * Lista de personagens definidos para a história.
   */
  characters: string[];

  /**
   * Cenário onde a história se passa.
   */
  setting: string;

  /**
   * Callback executado ao clicar no botão de salvar.
   */
  onSave?: () => void;

  /**
   * Define se o botão de salvar pode ser utilizado.
   */
  canSave?: boolean;

  /**
   * Indica estado de carregamento durante o salvamento.
   */
  isSaving?: boolean;

  /**
   * Indica se a história já foi salva.
   */
  isSaved?: boolean;
}

/**
 * Componente lateral responsável por exibir
 * o resumo estruturado da história criada.
 *
 * Responsabilidades:
 * - Exibir os parâmetros escolhidos pelo usuário
 * - Exibir ícones e indicadores visuais contextuais
 * - Permitir salvar a história na biblioteca
 * - Permitir iniciar nova história
 * @component
 */
export function StorySidebar({
  theme,
  ageGroup,
  value,
  characters,
  setting,
  onSave,
  canSave = false,
  isSaving = false,
  isSaved = false
}: StorySidebarProps) {

  /**
   * Converte o valor numérico da faixa etária
   * para um rótulo textual compreensível.
   */
  const getAgeLabel = (val: number) => {
    if (val < 33) return "3-5 anos";
    if (val < 66) return "6-8 anos";
    return "9-12 anos";
  };

  /**
   * Retorna um emoji representando visualmente o tema.
   */
  const getThemeIcon = (t: string) => {
    if (t === "Aventura") return "🏞️";
    if (t === "Amizade") return "🦊";
    if (t === "Mistério") return "🔍";
    return "✏️";
  };

  /**
   * Retorna o ícone e cor associados ao valor educacional.
   */
  const getValueIcon = (t: string) => {
    if (t === "Honestidade")
      return { icon: Shield, color: "text-yellow-500" };

    if (t === "Trabalho em Equipe")
      return { icon: Users, color: "text-blue-500" };

    if (t === "Bondade")
      return { icon: Heart, color: "text-pink-500" };

    return { icon: Edit3, color: "text-slate-600" };
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Card de resumo da história */}
      <div className="bg-cyan-50 rounded-3xl p-6 border border-cyan-100 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-6">
          Resumo da História
        </h2>

        <div className="space-y-6">

          {/* Tema */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg text-teal-600 shadow-sm">
              <span className="text-xl">{getThemeIcon(theme)}</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tema
              </p>
              <p className="font-bold text-slate-800">
                {theme}
              </p>
            </div>
          </div>

          {/* Faixa Etária */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg text-teal-600 shadow-sm">
              <span className="text-xl">😊</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Faixa Etária
              </p>
              <p className="font-bold text-slate-800">
                {getAgeLabel(ageGroup)}
              </p>
            </div>
          </div>

          {/* Valor Educacional */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg text-yellow-500 shadow-sm">
              {(() => {
                const { icon: Icon, color } = getValueIcon(value);
                return <Icon className={color} size={20} />;
              })()}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Valor
              </p>
              <p className="font-bold text-slate-800">
                {value}
              </p>
            </div>
          </div>

          {/* Personagens */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg text-blue-500 shadow-sm">
              <User size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Personagens
              </p>
              <p className="font-bold text-slate-800 leading-tight">
                {characters.join(", ")}
              </p>
            </div>
          </div>

          {/* Cenário */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg text-green-500 shadow-sm">
              <span className="text-xl">🌍</span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Cenário
              </p>
              <p className="font-bold text-slate-800">
                {setting}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Botão de salvar história */}
      <button
        type="button"
        disabled={!canSave || isSaving || isSaved}
        onClick={onSave}
        className="w-full bg-teal-400 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-teal-100 flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        <Save size={20} />
        {isSaved
          ? "Salvo"
          : isSaving
          ? "Salvando..."
          : "Salvar na Biblioteca"}
      </button>

      {/* Botão para iniciar nova história */}
      <Link
        href="/create"
        onClick={(e) => {
          /**
           * Sinaliza cancelamento de possível requisição ativa
           * relacionada à geração da história.
           */
          sessionStorage.setItem("cancel_story_request", "true");

          /**
           * Pequeno delay para garantir que o sinal
           * seja processado antes da navegação.
           */
          e.preventDefault();
          setTimeout(() => {
            window.location.href = "/create";
          }, 100);
        }}
        className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95"
      >
        <PlusCircle size={20} />
        Criar Nova História
      </Link>

    </div>
  );
}
