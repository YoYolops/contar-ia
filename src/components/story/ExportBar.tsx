"use client";

/**
 * Componente de barra de exportação e compartilhamento de histórias.
 *
 * Responsabilidades:
 * • Exibir ações para exportar a história em diferentes formatos (PDF e DOCX)
 * • Manter layout responsivo para desktop e mobile.
 */
import { FileText, Share2, FileType } from "lucide-react";
import { exportStoryAsPdf, exportStoryAsDocx } from "@/utils/exportStory";

/**
 * Propriedades esperadas pelo componente ExportBar.
 */
interface ExportBarProps {
  /**
   * Conteúdo textual da história que será exportada.
   */
  story: string;
}

/**
 * ExportBar
 *
 * Renderiza uma barra de ações contendo:
 * • Botão para exportar como PDF
 * • Botão para exportar como DOCX *
 * @param story Texto da história a ser exportada
 */
export function ExportBar({ story }: ExportBarProps) {
  return (
    <div
      className="
        mt-8
        bg-slate-100
        rounded-2xl
        p-4
        flex
        flex-col
        sm:flex-row
        items-center
        justify-between
        gap-4
      "
    >
      {/* Título da seção */}
      <span className="font-bold text-slate-700 text-lg">
        Exportar e Compartilhar
      </span>

      {/* Grupo de botões de ação */}
      <div className="flex gap-3">
        {/* =========================
            Botão — Exportar como PDF
           ========================= */}
        <button
          /**
           * Ao clicar, chama a função utilitária responsável
           * por gerar e baixar o arquivo PDF da história.
           */
          onClick={() => exportStoryAsPdf(story)}
          className="
            flex items-center gap-2
            bg-white border
            px-4 py-2
            rounded-lg
            font-semibold
            text-slate-600
            hover:text-red-500
            hover:border-red-200
            transition-colors
          "
        >
          {/* Ícone representando arquivo PDF */}
          <FileType size={18} /> PDF
        </button>

        {/* =========================
            Botão — Exportar como DOCX
           ========================= */}
        <button
          /**
           * Ao clicar, chama a função utilitária responsável
           * por gerar e baixar o arquivo DOCX da história.
           */
          onClick={() => exportStoryAsDocx(story)}
          className="
            flex items-center gap-2
            bg-white border
            px-4 py-2
            rounded-lg
            font-semibold
            text-slate-600
            hover:text-blue-500
            hover:border-blue-200
            transition-colors
          "
        >
          {/* Ícone representando documento de texto */}
          <FileText size={18} /> DOCX
        </button>
      </div>
    </div>
  );
}
