import React from "react";

/**
 * Propriedades esperadas pelo componente ThemeSelector.
 */
interface ThemeSelectorProps {
  /**
   * Tema atualmente selecionado.
   */
  selectedTheme: string;

  /**
   * Função chamada quando um novo tema é selecionado.
   * Recebe como parâmetro o id do tema escolhido.
   */
  onSelect: (theme: string) => void;
}

/**
 * Componente de seleção de temas para geração de histórias.
 *
 * Responsabilidades:
 * • Exibir lista visual de temas disponíveis
 * • Destacar o tema atualmente selecionado
 * • Notificar o componente pai quando um tema for escolhido
 * • Manter layout responsivo em grid
 *
 * Observação:
 * Este componente é controlado (controlled component),
 * pois o estado do tema selecionado vem do componente pai.
 */
export function ThemeSelector({
  selectedTheme,
  onSelect,
}: ThemeSelectorProps): React.ReactNode {
  /**
   * Lista de temas disponíveis.
   * Cada item define:
   * • id → identificador do tema
   * • color → cor de fundo decorativa
   * • icon → emoji representativo
   * • border → cor da borda quando selecionado
   */
  const themes = [
    {
      id: "Aventura",
      color: "bg-green-100",
      icon: "🏞️",
      border: "border-teal-400",
    },
    {
      id: "Amizade",
      color: "bg-orange-100",
      icon: "🦊",
      border: "border-teal-400",
    },
    {
      id: "Mistério",
      color: "bg-purple-100",
      icon: "🔍",
      border: "border-teal-400",
    },
    {
      id: "OUTRO",
      color: "bg-slate-100",
      icon: "✏️",
      border: "border-teal-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {themes.map((theme) => {
        const isSelected = selectedTheme === theme.id;

        return (
          <button
            key={theme.id}
            /**
             * Ao clicar, dispara callback para o componente pai
             * informando qual tema foi escolhido.
             */
            onClick={() => onSelect(theme.id)}
            className={`
              relative
              group
              overflow-hidden
              rounded-2xl
              h-32
              border-4
              transition-all
              flex flex-col
              items-center
              justify-center
              gap-2
              ${
                isSelected
                  ? `${theme.border} scale-[1.03] shadow-md`
                  : "border-transparent opacity-80 hover:opacity-100 hover:border-slate-200"
              }
            `}
          >
            {/* Camada de fundo decorativa */}
            <div className={`absolute inset-0 ${theme.color}`} />

            {/* Ícone do tema */}
            <div className="relative z-10 text-4xl">{theme.icon}</div>

            {/* Nome do tema */}
            <span className="relative z-10 font-bold text-base text-slate-800">
              {theme.id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
