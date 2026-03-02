"use client";

/**
 * Página institucional "Saiba Mais" (LearnMorePage).
 *
 * Responsabilidades desta página:
 *
 * • Apresentar a proposta pedagógica da plataforma Contar-IA
 * • Explicar como funciona o processo de criação de histórias
 * • Destacar os principais benefícios para educadores
 * • Conduzir o usuário para a ação principal (criar história)
 * • Reforçar credibilidade, segurança e propósito educacional
 *
 * Esta é uma página estática (informativa e estratégica),
 * com foco em conversão e apresentação de valor.
 *
 * Estrutura principal:
 * • Navbar (topo)
 * • Seção Hero institucional
 * • Seção "Como funciona"
 * • Seção de benefícios
 * • Seção Call To Action (CTA)
 * • Footer
 */
import Link from "next/link";
import { Navbar } from "@/components/Navbar"; 
import { Footer } from "@/components/Footer";
import { Sparkles, Brain, Clock, Shield, Palette, BookOpen } from "lucide-react";
import { Disclaimer } from "@/components/story/Disclaimer";

export default function LearnMorePage() {

  /**
   * Renderização principal da página.
   * Layout base:
   * - min-h-screen → ocupa altura total da viewport
   * - flex + flex-col → estrutura vertical
   * - main → conteúdo central expansível
   */
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-slate-800">
      
      {/* 
        Barra de navegação principal da aplicação.
        Permite navegação entre páginas públicas.
      */}
      <Navbar />

      <main className="flex-grow">
        
        {/* 
          =========================
          HERO SECTION INSTITUCIONAL
          =========================
          
          Objetivo:
          • Apresentar o propósito da plataforma
          • Comunicar valor pedagógico
          • Criar conexão emocional com educadores
        */}
        <section className="py-20 px-6 text-center bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block py-1 px-3 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mb-6">
              Para Educadores e Crianças
            </span>

            {/* Headline principal de impacto */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
              Transforme a Imaginação em <br />
              <span className="text-teal-400">Leitura e Aprendizagem</span>
            </h1>

            {/* Texto descritivo institucional */}
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              O Contar-IA não é apenas um gerador de textos. É uma ferramenta pedagógica 
              projetada para criar conexões emocionais, ensinar valores e tornar o hábito 
              da leitura irresistível para as crianças.
            </p>
          </div>
        </section>


        {/* 
          =========================
          SEÇÃO: COMO FUNCIONA
          =========================
          
          Explica o fluxo de uso da plataforma em 3 passos:
          1. Definir cenário
          2. Escolher valores
          3. Gerar e compartilhar história
        */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">

            {/* Título da seção */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900">Como funciona a magia?</h2>
              <p className="text-slate-500 mt-2">
                Crie uma história completa em menos de 1 minuto.
              </p>
            </div>

            {/* Grid com 3 etapas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

              {/* Linha decorativa horizontal (desktop) */}
              <div className="hidden md:block absolute top-12 left-0 w-full h-1 bg-gradient-to-r from-teal-100 via-teal-200 to-teal-100 -z-10 rounded-full"></div>

              {/* Etapa 1 */}
              {/* Define contexto narrativo */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg text-center relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-24 h-24 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                  <Palette size={40} className="text-teal-500" />
                </div>
                <div className="absolute top-0 right-0 bg-teal-400 text-white w-8 h-8 flex items-center justify-center rounded-bl-2xl rounded-tr-2xl font-bold">1</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Defina o cenário</h3>
                <p className="text-slate-500">
                  Escolha um tema (Aventura, Mistério...), defina a faixa etária da criança e escolha os protagonistas.
                </p>
              </div>

              {/* Etapa 2 */}
              {/* Define valores pedagógicos da história */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg text-center relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-24 h-24 mx-auto bg-purple-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                  <Brain size={40} className="text-purple-500" />
                </div>
                <div className="absolute top-0 right-0 bg-purple-400 text-white w-8 h-8 flex items-center justify-center rounded-bl-2xl rounded-tr-2xl font-bold">2</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Escolha os valores</h3>
                <p className="text-slate-500">
                  Selecione o que a história deve ensinar: Honestidade, Coragem, Amizade ou Trabalho em Equipe.
                </p>
              </div>

              {/* Etapa 3 */}
              {/* Geração e compartilhamento */}
              <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg text-center relative group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-24 h-24 mx-auto bg-yellow-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                  <BookOpen size={40} className="text-yellow-500" />
                </div>
                <div className="absolute top-0 right-0 bg-yellow-400 text-white w-8 h-8 flex items-center justify-center rounded-bl-2xl rounded-tr-2xl font-bold">3</div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Leia e compartilhe</h3>
                <p className="text-slate-500">
                  O Contar-IA cria a sua história completa. Você pode ler online, exportar como PDF/DOCX ou imprimir!
                </p>
              </div>

            </div>
          </div>
        </section>


        {/* 
          =========================
          SEÇÃO: BENEFÍCIOS
          =========================
          
          Mostra argumentos de valor:
          • Economia de tempo
          • Segurança de conteúdo
          • Criatividade
          • Personalização cognitiva
        */}
        <section className="py-20 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Por que usar o Contar-IA?</h2>

            {/* Grid de benefícios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Economia de Tempo</h3>
                  <p className="text-slate-500 text-sm">
                    Professores gastam horas planejando atividades. Com nossa ferramenta, você cria material de leitura personalizado em pouco tempo.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Conteúdo Seguro</h3>
                  <p className="text-slate-500 text-sm">
                    Nossa IA é treinada com filtros rigorosos para garantir que todo o conteúdo gerado seja 100% apropriado para crianças.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-shrink-0 w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center text-pink-600">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Criatividade Sem Fim</h3>
                  <p className="text-slate-500 text-sm">
                    Nunca mais fique sem ideias. Misture astronautas com dragões ou fadas com robôs. As possibilidades são infinitas.
                  </p>
                </div>
              </div>

              <div className="flex gap-5 p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                  <Brain size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">Personalização Cognitiva</h3>
                  <p className="text-slate-500 text-sm">
                    Adapte a complexidade do texto à idade da criança (3 a 12 anos), garantindo que o vocabulário seja adequado.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </section>

 
        {/* 
          =========================
          CALL TO ACTION (CTA)
          =========================
          
          Objetivo:
          • Converter visitante em usuário ativo
          • Incentivar criação de primeira história
          • Reforçar gratuidade inicial
        */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto bg-slate-900 rounded-[3rem] p-12 relative overflow-hidden">
            
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500 rounded-full blur-[100px] opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>

            {/* Título CTA */}
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 relative z-10">
              Pronto para encantar os seus alunos?
            </h2>

            {/* Texto de reforço */}
            <p className="text-slate-300 mb-8 text-lg relative z-10">
              Junte-se a milhares de educadores e comece a criar histórias hoje mesmo. 
              É gratuito para começar.
            </p>
            
            {/* Botão principal de ação */}
            <Link 
              href="/create"
              className="inline-flex items-center gap-2 bg-teal-400 hover:bg-teal-500 text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-teal-900/50 transition-transform hover:scale-105 relative z-10"
            >
              <Sparkles size={20} />
              Criar História Grátis
            </Link>
            <Disclaimer />
          </div>
        </section>

      </main>

      {/* Rodapé institucional */}
      <Footer />
    </div>
  );
}
