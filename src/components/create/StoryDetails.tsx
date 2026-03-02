"use client";

import { X } from "lucide-react";
import { useState } from "react";

/**
 * Propriedades esperadas pelo componente StoryDetails.
 */
interface StoryDetailsProps {
  /**
   * Lista atual de personagens definidos.
   */
  characters: string[];

  /**
   * Cenário atual da história.
   */
  setting: string;

  /**
   * Callback disparado quando o cenário é alterado.
   */
  onSettingChange: (value: string) => void;

  /**
   * Callback disparado quando a lista de personagens é alterada.
   */
  onCharactersChange: (chars: string[]) => void;
}

/**
 * Componente responsável pela definição detalhada da história.
 *
 * Responsabilidades:
 * • Permitir adicionar personagens via input (pressionando Enter)
 * • Permitir remover personagens individualmente
 * • Permitir definir ou editar o cenário
 * • Manter controle local apenas do input temporário
 *
 * Observação:
 * Este é um Client Component pois utiliza estado (useState)
 * e manipuladores de eventos do React.
 */
export function StoryDetails({
  characters,
  setting,
  onSettingChange,
  onCharactersChange,
}: StoryDetailsProps) {
  /**
   * Estado local para armazenar temporariamente
   * o valor digitado antes de adicioná-lo à lista.
   */
  const [inputValue, setInputValue] = useState("");

  /**
   * Adiciona um personagem ao pressionar Enter.
   * Ignora valores vazios ou compostos apenas por espaços.
   */
  function handleAddCharacter(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      onCharactersChange([
        ...characters,
        inputValue.trim(),
      ]);

      setInputValue("");
    }
  }

  /**
   * Remove personagem pelo índice.
   */
  function removeCharacter(index: number) {
    const updated = characters.filter(
      (_, i) => i !== index
    );

    onCharactersChange(updated);
  }

  return (
    <section className="space-y-6">
      {/* ================= Personagens ================= */}
      <div>
        <label className="block text-lg font-bold mb-2">
          Quais são as personagens principais?{" "}
          <span className="text-slate-400 font-normal text-sm">
          </span>
        </label>

        <div
          className="
            flex flex-wrap items-center gap-2
            bg-white
            border border-slate-200
            rounded-xl
            p-3
            shadow-sm
            focus-within:ring-2
            focus-within:ring-teal-400
            transition-all
          "
        >
          {/* Lista de personagens já adicionados */}
          {characters.map((char, index) => (
            <span
              key={index}
              className="
                bg-teal-50
                text-teal-700
                px-3 py-1
                rounded-full
                text-sm
                font-semibold
                flex items-center gap-1
              "
            >
              {char}

              {/* Botão para remover personagem */}
              <X
                size={14}
                className="cursor-pointer hover:text-teal-900"
                onClick={() => removeCharacter(index)}
              />
            </span>
          ))}

          {/* Campo de entrada para novo personagem */}
          <input
            type="text"
            placeholder="ex: Um robô curioso..."
            value={inputValue}
            onChange={(e) =>
              setInputValue(e.target.value)
            }
            onKeyDown={handleAddCharacter}
            className="
              flex-grow
              outline-none
              bg-transparent
              text-slate-700
              placeholder-slate-400
              min-w-[150px]
            "
          />
        </div>
      </div>

      {/* ================= Cenário ================= */}
      <div>
        <label className="block text-lg font-bold mb-2">
          Onde se passa a história?{" "}
          <span className="text-slate-400 font-normal text-sm">
          </span>
        </label>

        <input
          type="text"
          value={setting}
          onChange={(e) =>
            onSettingChange(e.target.value)
          }
          placeholder="ex: Uma floresta encantada, uma cidade futurista..."
          className="
            w-full
            bg-white
            border border-slate-200
            rounded-xl
            p-4
            shadow-sm
            outline-none
            focus:ring-2
            focus:ring-teal-400
            transition-all
          "
        />
      </div>
    </section>
  );
}
