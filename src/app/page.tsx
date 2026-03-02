import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Footer } from "@/components/Footer";

/**
 * Página inicial da aplicação.
 *
 * Responsabilidades:
 * • Exibir a barra de navegação principal (Navbar)
 * • Apresentar a seção principal de destaque (Hero)
 * • Exibir o rodapé da aplicação (Footer)
 * • Definir o layout base da Home com altura mínima da tela
 */
export default function Home() {
  return (
    <div
      className="
        min-h-screen          /* Garante altura mínima igual à viewport */
        flex flex-col         /* Layout vertical */
        bg-gradient-to-b      /* Gradiente vertical de fundo */
        from-white to-slate-50
        font-sans             /* Fonte padrão sem serifa */
      "
    >
      {/* ================= Barra de navegação superior ================= */}
      <Navbar />

      {/* ================= Conteúdo principal da página ================= */}
      <main
        className="
          flex-grow           /* Ocupa todo o espaço restante */
          flex                /* Permite centralização com flexbox */
          items-center        /* Centraliza verticalmente */
          justify-center      /* Centraliza horizontalmente */
          w-full
        "
      >
        {/* Seção principal de apresentação */}
        <Hero />
      </main>

      {/* ================= Rodapé ================= */}
      <Footer />
    </div>
  );
}
