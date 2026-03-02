/**
 * Componente de aviso legal e informativo (Disclaimer).
 *
 * Responsabilidades:
 * • Exibir informações sobre proteção de dados (LGPD)
 * • Informar limitações de uso e direitos autorais do conteúdo gerado
 * • Reforçar a responsabilidade do usuário ao utilizar a plataforma
 * • Apresentar mensagem de caráter informativo (não jurídico)
 *
 * Observação:
 * Este componente é puramente visual (Server Component por padrão),
 * não possui estado, efeitos colaterais ou interações do usuário.
 */
import { ShieldAlert, FileWarning } from "lucide-react";

/**
 * Disclaimer.
 * Renderiza um bloco de aviso.
 * Usado normalmente ao final de páginas que geram conteúdo
 * personalizado ou sensível.
 */
export function Disclaimer() {
  return (
    <div
      className="
        mt-8
        bg-white
        border border-slate-200
        p-6
        rounded-3xl
        shadow-sm
      "
    >
      {/* =========================
          Título do aviso
         ========================= */}
      <h2
        className="
          text-xl
          font-bold
          text-slate-800
          mb-4
          flex items-center gap-2
        "
      >
        {/* Ícone de alerta/segurança */}
        <ShieldAlert size={22} className="text-red-500" />
        Aviso Importante
      </h2>

      {/* =========================
          Conteúdo principal
         ========================= */}
      <div className="space-y-4 text-sm leading-relaxed text-slate-700">
        {/* ---------- LGPD ---------- */}
        <p>
          <strong>LGPD - Proteção de Dados:</strong>
          <br />
          Este sistema processa informações fornecidas pelo usuário
          exclusivamente para geração de conteúdo personalizado. Nenhuma
          informação pessoal é armazenada para fins comerciais, e todos os dados
          são tratados de acordo com os princípios da{" "}
          <strong>
            Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
          </strong>.
        </p>

        {/* ---------- Direitos autorais ---------- */}
        <p>
          <strong>Direitos Autorais e Uso da História:</strong>
          <br />
          As histórias geradas por Inteligência Artificial podem conter
          elementos criativos que remetem a obras protegidas por terceiros. Por
          esse motivo, o conteúdo aqui gerado{" "}
          <strong>
            não deve ser comercializado ou distribuído como obra original
          </strong>
          . Seu uso é restrito a fins pessoais, educacionais e recreativos.
        </p>

        {/* ---------- Responsabilidade ---------- */}
        <p>
          <strong>Responsabilidade do Usuário:</strong>
          <br />
          Ao utilizar esta plataforma, você concorda em respeitar direitos
          autorais, evitar o uso indevido do conteúdo gerado e seguir as boas
          práticas de segurança e privacidade.
        </p>
      </div>

      {/* =========================
          Rodapé informativo
         ========================= */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
        {/* Ícone de aviso documental */}
        <FileWarning size={16} />

        {/* Nota de isenção jurídica */}
        Este aviso tem caráter informativo e não substitui orientação jurídica.
      </div>
    </div>
  );
}
