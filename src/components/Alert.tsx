"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

/**
 * Interface de propriedades do componente Alert.
 */
interface AlertProps {
  /**
   * Tipo do alerta, define o esquema de cores.
   * @default "error"
   */
  type?: "error" | "warning" | "info";

  /**
   * Título opcional exibido acima da mensagem.
   */
  title?: string;

  /**
   * Mensagem principal do alerta.
   */
  message: string;

  /**
   * Callback executado ao fechar o alerta.
   */
  onClose?: () => void;

  /**
   * Define se o alerta pode ser fechado manualmente.
   * @default true
   */
  dismissible?: boolean;
}

/**
 * Componente reutilizável para exibição de mensagens de alerta.
 * Suporta diferentes variações visuais (erro, aviso e informação),
 * podendo ser descartável e executar callback ao ser fechado.
 * @component
 */
export function Alert({
  type = "error",
  title,
  message,
  onClose,
  dismissible = true,
}: AlertProps) {
  /**
   * Estado interno que controla a visibilidade do alerta.
   */
  const [isVisible, setIsVisible] = useState(true);

  /**
   * Caso o alerta não esteja visível,
   * o componente não é renderizado.
   */
  if (!isVisible) return null;

  /**
   * Manipulador de fechamento do alerta.
   * Executa:
   * 1. Oculta o componente
   * 2. Dispara callback opcional (se fornecido)
   */
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  /**
   * Mapeamento de estilos por tipo de alerta.
   */
  const styles = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  /**
   * Mapeamento de cores do ícone por tipo.
   */
  const iconColors = {
    error: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
  };

  return (
    <div
      className={`${styles[type]} border-2 rounded-xl p-4 md:p-6 shadow-sm mb-6`}
    >
      <div className="flex items-start gap-4">

        {/* Ícone visual do alerta */}
        <AlertTriangle
          className={`${iconColors[type]} flex-shrink-0 mt-0.5`}
          size={24}
        />

        {/* Conteúdo textual */}
        <div className="flex-grow">
          {title && (
            <h3 className="font-bold text-lg mb-2">{title}</h3>
          )}
          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>

        {/* Botão de fechamento (se habilitado) */}
        {dismissible && (
          <button
            onClick={handleClose}
            className={`${iconColors[type]} hover:opacity-70 transition-opacity flex-shrink-0`}
            aria-label="Fechar alerta"
          >
            <X size={20} />
          </button>
        )}

      </div>
    </div>
  );
}
