import Link from "next/link";
import { BookOpen } from "lucide-react";

/**
 * Componente de cabeçalho principal da aplicação.
 *
 * Renderiza um header responsivo contendo:
 * - Link para a página inicial
 * - Ícone representativo (livro aberto)
 * - Nome da aplicação (Contar-IA)
 *
 * O componente é puramente visual e não possui estado interno.
 * @component
 * @returns Cabeçalho estilizado com navegação para a home
 */
export function Header() {
  return (
    <header className="w-full p-6 md:p-10 flex items-center justify-between">
      <Link 
        href="/" 
        className="flex items-center gap-2 font-bold text-xl text-slate-800 hover:opacity-80 transition-opacity"
      >
        <div className="bg-white p-1.5 rounded-lg shadow-sm text-teal-600">
          <BookOpen size={24} />
        </div>

        <span>Contar-IA</span>
      </Link>
    </header>
  );
}
