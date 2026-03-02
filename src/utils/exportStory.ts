"use client";

/**
 * Módulo de exportação de histórias para PDF e DOCX (lado do cliente).
 *
 * Este arquivo fornece utilitários para converter conteúdo em Markdown
 * em documentos finais baixáveis pelo usuário, incluindo automaticamente
 * um aviso legal (disclaimer) ao final.
 *
 * Executa apenas no client-side (browser), pois:
 * - Manipula o DOM
 * - Dispara downloads de arquivos
 * - Usa bibliotecas que dependem do ambiente do navegador
 */
import { marked } from "marked";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

/**
 * Título padrão do aviso legal inserido nos documentos exportados.
 */
export const DISCLAIMER_TITLE = "Aviso Importante";

/**
 * Texto padrão do aviso legal.
 *
 * Inclui informações sobre:
 * - LGPD (proteção de dados)
 * - Direitos autorais
 * - Uso permitido do conteúdo gerado por IA
 * - Responsabilidade do usuário
 *
 * Este texto é anexado automaticamente ao final dos documentos exportados.
 */
export const DISCLAIMER_TEXT = `
LGPD – Proteção de Dados:
Este sistema processa informações fornecidas pelo usuário exclusivamente para geração de conteúdo personalizado. Nenhuma informação pessoal é armazenada para fins comerciais, e todos os dados são tratados de acordo com os princípios da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

Direitos Autorais e Uso da História:
As histórias geradas por Inteligência Artificial podem conter elementos criativos que remetem a obras protegidas por terceiros. Por esse motivo, o conteúdo aqui gerado não deve ser comercializado ou distribuído como obra original. Seu uso é restrito a fins pessoais, educacionais e recreativos.

Responsabilidade do Usuário:
Ao utilizar esta plataforma, você concorda em respeitar direitos autorais, evitar o uso indevido do conteúdo gerado e seguir as boas práticas de segurança e privacidade.

Este aviso tem caráter informativo e não substitui orientação jurídica.
`;

/**
 * Exporta uma história em Markdown como arquivo PDF.
 *
 * Fluxo:
 * 1. Converte Markdown para HTML
 * 2. Insere o conteúdo em um container estilizado
 * 3. Adiciona o aviso legal ao final
 * 4. Gera e baixa automaticamente o PDF
 *
 * @param markdown Conteúdo da história em formato Markdown
 */
export async function exportStoryAsPdf(markdown: string) {
  /**
   * Importação dinâmica da biblioteca html2pdf.
   * Evita aumentar o bundle inicial da aplicação.
   */
  const html2pdf = (await import("html2pdf.js")).default;

  /**
   * Converte Markdown para HTML.
   */
  const html = marked(markdown);

  /**
   * Cria um container DOM para renderização do conteúdo.
   * O HTML será processado pela biblioteca html2pdf.
   */
  const container = document.createElement("div");

  /**
   * Estrutura do documento:
   * - Conteúdo principal formatado
   * - Linha separadora
   * - Título do aviso legal
   * - Texto do aviso legal
   */
  const disclaimerParagraphs = DISCLAIMER_TEXT.trim()
    .split("\n\n")
    .map(
      (p) => `
        <p class="disclaimer-text">${p}</p>
      `,
    )
    .join("");

  container.innerHTML = `
    <div style="
      font-family: Arial, sans-serif;
      color: #000;
      font-size: 12pt;
      line-height: 1.5;
      padding: 32px;
      max-width: 800px;
    ">

      <style>
        h1 {
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 16pt;
        }

        h2 {
          font-size: 18pt;
          font-weight: bold;
          margin-bottom: 14pt;
        }

        h3 {
          font-size: 16pt;
          font-weight: bold;
          margin-bottom: 12pt;
        }

        p {
          font-size: 12pt;
          margin-bottom: 12pt;
        }

        hr {
          margin: 32pt 0;
        }

        .disclaimer-title {
          font-size: 18pt;
          font-weight: bold;
          margin-top: 24pt;
          margin-bottom: 12pt;
        }

        .disclaimer-text {
          font-size: 10pt;
          font-style: italic;
          margin-bottom: 10pt;
        }
      </style>

      ${html}

      <hr />

      <div class="disclaimer-title">
        ${DISCLAIMER_TITLE}
      </div>

      ${disclaimerParagraphs}

    </div>
  `;

  /**
   * Configura e gera o PDF.
   *
   * Opções aplicadas:
   * - Margem: 10 mm
   * - Nome do arquivo: contar-ia.pdf
   * - Escala de renderização: 2 (melhor qualidade)
   * - Formato: A4
   * - Orientação: Retrato (portrait)
   */
  html2pdf()
    .from(container)
    .set({
      margin: 12,
      filename: "contar-ia.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .save();
}

/**
 * Exporta uma história em Markdown como arquivo DOCX (Microsoft Word).
 *
 * Fluxo:
 * 1. Tokeniza o Markdown em elementos estruturados
 * 2. Converte tokens em parágrafos DOCX
 * 3. Adiciona o aviso legal ao final
 * 4. Gera o arquivo .docx e inicia o download
 *
 * @param markdown Conteúdo da história em formato Markdown
 */
export async function exportStoryAsDocx(markdown: string) {
  /**
   * Converte o Markdown em tokens estruturados
   * (títulos, parágrafos, etc.).
   */
  const tokens = marked.lexer(markdown);

  /**
   * Converte cada token em um objeto Paragraph da biblioteca docx.
   */
  const paragraphs: Paragraph[] = tokens.map((token: any) => {
    /**
     * Tratamento de títulos (headings).
     */
    if (token.type === "heading") {
      let size = 32;

      if (token.depth === 1) size = 48;
      else if (token.depth === 2) size = 36;
      else if (token.depth === 3) size = 32;

      return new Paragraph({
        children: [
          new TextRun({
            text: token.text,
            font: "Arial",
            size,
            bold: true,
          }),
        ],
        spacing: { after: 240 },
      });
    }

    /**
     * Tratamento de parágrafos.
     */
    if (token.type === "paragraph") {
      return new Paragraph({
        children: [
          new TextRun({
            text: token.text,
            font: "Arial",
            size: 24,
          }),
        ],
        spacing: { after: 240 },
      });
    }

    return new Paragraph("");
  });

  /**
   * Linha separadora (simulação do <hr>)
   */
  const divider = new Paragraph({
    border: {
      bottom: {
        color: "auto",
        space: 1,
        style: "single",
        size: 6,
      },
    },
    spacing: { before: 480, after: 480 },
  });

  /**
   * Parágrafos do disclaimer.
   */
  const disclaimerParagraphs = [
    new Paragraph({
      children: [
        new TextRun({
          text: DISCLAIMER_TITLE,
          font: "Arial",
          size: 36,
          bold: true,
        }),
      ],
      spacing: { before: 360, after: 240 },
    }),

    ...DISCLAIMER_TEXT.trim().split("\n\n").map(
      (text) =>
        new Paragraph({
          children: [
            new TextRun({
              text,
              font: "Arial",
              size: 20,
              italics: true,
            }),
          ],
          spacing: { after: 200 },
        }),
    ),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...paragraphs,
          divider,
          ...disclaimerParagraphs,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);

  saveAs(blob, "contar-ia.docx");
}
