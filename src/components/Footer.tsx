import React from "react";

/**
 * Componente de rodapé institucional da aplicação.
 *
 * Renderiza um footer responsivo contendo:
 * - Informação de direitos autorais
 * - Nome da aplicação (Contar-IA)
 * - Mensagem institucional sobre o propósito educacional
 * - Elemento visual simbólico (coração)
 *
 * O componente é puramente visual e não possui estado interno.
 * @component
 * @returns Rodapé estilizado exibido na parte inferior da interface
 */
export function Footer() {
  return (
    <footer className="w-full py-6 px-4 text-center text-sm text-slate-400 mt-auto">
      <p>
        © 2025 Contar-IA. Todos os direitos reservados.
        <span className="block sm:inline sm:ml-1">
          Feito com <span className="text-red-400">❤️</span> para educadores e crianças.
        </span>
      </p>
    </footer>
  );
}
