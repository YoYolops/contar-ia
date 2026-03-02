import { Edit3, Heart, Shield, User, Users } from "lucide-react";

/**
 * Propriedades esperadas pelo componente StorySidebar.
 */
interface StorySidebarProps {
  /**
   * Tema escolhido para a história.
   */
  theme: string;

  /**
   * Valor numérico representando a faixa etária selecionada
   * (geralmente proveniente de um slider).
   */
  ageGroup: number;

  /**
   * Valor moral ou educativo da história.
   */
  value: string;

  /**
   * Lista de personagens definidos pelo usuário.
   */
  characters: string[];

  /**
   * Descrição do cenário da história.
   */
  setting: string;
}

/**
 * Componente de resumo da história em construção.
 *
 * Responsabilidades:
 * • Exibir as escolhas feitas pelo usuário
 * • Traduzir valores numéricos em rótulos compreensíveis
 * • Mostrar ícones visuais representativos
 * • Exibir estados vazios quando dados não foram preenchidos
 * • Servir como painel lateral informativo (sidebar)
 */
export function StorySidebar({
  theme,
  ageGroup,
  value,
  characters,
  setting,
}: StorySidebarProps) {
  /**
   * Converte o valor numérico da faixa etária
   * em uma etiqueta legível para o usuário.
   */
  const getAgeLabel = (val: number) => {
    if (val < 33) return "3-5 anos";
    if (val < 66) return "6-8 anos";
    return "9-12 anos";
  };

  /**
   * Retorna um emoji representativo para o tema escolhido.
   */
  const getThemeIcon = (t: string) => {
    if (t === "Aventura") return "🏞️";
    if (t === "Amizade") return "🦊";
    if (t === "Mistério") return "🔍";
    return "✏️";
  };

  /**
   * Retorna o ícone e a cor associados ao valor educativo.
   */
  const getValueIcon = (t: string) => {
    if (t === "Honestidade")
      return { icon: Shield, color: "text-yellow-500" };

    if (t === "Trabalho em Equipe")
      return { icon: Users, color: "text-blue-500" };

    if (t === "Bondade")
      return { icon: Heart, color: "text-pink-500" };

    // Valor padrão
    return { icon: Edit3, color: "text-slate-600" };
  };

  return (
    <div className="bg-cyan-50 rounded-3xl p-6 border border-cyan-100 shadow-sm">
      {/* Título do painel */}
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        A Sua História
      </h2>

      <div className="space-y-6">
        {/* ================= Tema ================= */}
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Tema
          </p>

          <div className="flex items-center gap-3">
            {/* Ícone do tema */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-500 shadow-sm">
              {getThemeIcon(theme)}
            </div>

            {/* Nome do tema */}
            <span className="font-semibold text-slate-700">
              {theme}
            </span>
          </div>
        </div>

        {/* ================= Faixa Etária ================= */}
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Faixa Etária
          </p>

          <div className="flex items-center gap-3">
            {/* Ícone genérico de idade */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-500 shadow-sm">
              😊
            </div>

            {/* Label calculado a partir do valor numérico */}
            <span className="font-semibold text-slate-700">
              {getAgeLabel(ageGroup)}
            </span>
          </div>
        </div>

        {/* ================= Valor ================= */}
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Valor
          </p>

          <div className="flex items-center gap-3">
            {/* Ícone dinâmico do valor */}
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-teal-500 shadow-sm">
              {(() => {
                const { icon: Icon, color } = getValueIcon(value);
                return <Icon className={color} size={20} />;
              })()}
            </div>

            {/* Nome do valor */}
            <span className="font-semibold text-slate-700">
              {value}
            </span>
          </div>
        </div>

        {/* ================= Personagens ================= */}
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Personagens
          </p>

          {/* Estado vazio quando não há personagens */}
          {characters.length === 0 ? (
            <p className="text-slate-400 italic text-sm">
              Adicione personagens ao lado...
            </p>
          ) : (
            <ul className="space-y-3">
              {characters.map((char, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3"
                >
                  {/* Ícone do personagem */}
                  <div className="p-2 bg-white rounded-full text-red-400 shadow-sm">
                    <User size={16} />
                  </div>

                  {/* Nome do personagem */}
                  <span className="font-semibold text-slate-700">
                    {char}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ================= Cenário ================= */}
        <div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Cenário
          </p>

          {/* Estado vazio quando cenário não foi definido */}
          {setting.trim() === "" ? (
            <p className="text-slate-400 italic text-sm">
              À espera do seu lugar mágico...
            </p>
          ) : (
            <p className="font-semibold text-slate-700">
              {setting}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
