import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Award, CheckCircle2, Star, RotateCcw, ShieldCheck, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  fullName: string;
  completionDate: string;
  totalXP: number;
  challengesCompleted: number;
  onClose: () => void;
};

export function Certificate({ fullName, completionDate, totalXP, challengesCompleted, onClose }: Props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const certificateId = "SQ-" + Math.random().toString(36).substr(2, 9).toUpperCase();

  // Bloqueia o scroll do fundo ao abrir o certificado
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleLinkedInShare = () => {
    // completionDate esperada no formato "DD/MM/YYYY"
    const [, monthStr, yearStr] = completionDate.split("/");
    const issueYear = yearStr || String(new Date().getFullYear());
    const issueMonth = monthStr || String(new Date().getMonth() + 1);

    const certUrl = `${window.location.origin}/verify/${certificateId}`;

    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: "Mestria Avançada: A Jornada do Consultor SQL",
      organizationName: "SQL Quest Academy",
      issueYear,
      issueMonth,
      certId: certificateId,
      certUrl,
    });

    window.open(
      `https://www.linkedin.com/profile/add?${params.toString()}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handlePrint = () => {
    const front = document.getElementById("digital-certificate");
    const back = document.getElementById("digital-certificate-back");
    if (!front || !back) {
      window.print();
      return;
    }

    // Cria o container como filho direto de <body> para fugir de transforms/perspective herdados
    let printRoot = document.getElementById("certificate-print-root");
    if (!printRoot) {
      printRoot = document.createElement("div");
      printRoot.id = "certificate-print-root";
      document.body.appendChild(printRoot);
    }
    printRoot.innerHTML = "";

    const sanitize = (node: HTMLElement) => {
      node.removeAttribute("id");
      node.className = node.className
        .replace(/\babsolute\b/g, "")
        .replace(/\bbackface-hidden\b/g, "");
      node.style.transform = "none";
      node.style.position = "relative";
      node.style.inset = "auto";
      node.classList.add("print-page");
    };

    const frontClone = front.cloneNode(true) as HTMLElement;
    const backClone = back.cloneNode(true) as HTMLElement;
    sanitize(frontClone);
    sanitize(backClone);

    printRoot.appendChild(frontClone);
    printRoot.appendChild(backClone);

    setTimeout(() => {
      window.print();
      setTimeout(() => {
        if (printRoot) printRoot.innerHTML = "";
      }, 500);
    }, 50);
  };

  return (
    <motion.div
      id="certificate-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="max-w-4xl w-full flex flex-col gap-6 items-center">
        {/* Container para Flip */}
        <div className="relative w-full aspect-[1.414/1] perspective-1000 group">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.8, type: "spring", stiffness: 260, damping: 20 }}
            className="w-full h-full relative preserve-3d"
          >
            {/* FRONT SIDE */}
            <div
              id="digital-certificate"
              className="absolute inset-0 w-full h-full backface-hidden bg-[#f4ece0] text-[#1a1a1a] p-1 shadow-2xl overflow-hidden print:shadow-none bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {/* Ornate Border */}
              <div className="absolute inset-4 border-[1px] border-amber-900/20 pointer-events-none" />
              <div className="absolute inset-6 border-[3px] border-amber-900/40 pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none border-[16px] border-[#2a1b0a] border-double" />

              {/* Corner Ornaments */}
              <div className="absolute top-8 left-8 text-amber-900/40"><Star className="w-8 h-8" /></div>
              <div className="absolute top-8 right-8 text-amber-900/40"><Star className="w-8 h-8" /></div>
              <div className="absolute bottom-8 left-8 text-amber-900/40"><Star className="w-8 h-8" /></div>
              <div className="absolute bottom-8 right-8 text-amber-900/40"><Star className="w-8 h-8" /></div>

              {/* Background Crest */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                <ShieldCheck className="w-[500px] h-[500px] text-amber-900" />
              </div>

              <div className="relative z-10 flex flex-col items-center h-full text-center py-8 px-16">
                <div className="mb-3">
                  <span className="text-amber-900 text-xs font-mono tracking-[0.4em] font-bold uppercase opacity-60">
                    Documento de Autenticidade Digital — ID: {certificateId}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="h-[1px] w-12 bg-amber-900/30" />
                  <Award className="w-9 h-9 text-amber-600" />
                  <div className="h-[1px] w-12 bg-amber-900/30" />
                </div>

                <h1 className="text-5xl font-black mb-1 uppercase tracking-tighter text-[#0d0d0d]">
                  Certificado de Conclusão
                </h1>

                <h2 className="text-2xl text-amber-900/80 mb-6 italic font-medium">
                  Mestria Avançada: A Jornada do Consultor SQL
                </h2>

                <p className="text-base text-stone-600 mb-4">
                  Certificamos para os devidos fins que o explorador de dados
                </p>

                <div className="mb-5 w-full">
                  <h3 className="text-5xl font-bold text-[#1a1a1a] pb-2 border-b-2 border-amber-900/20 inline-block px-8">
                    {fullName}
                  </h3>
                </div>

                <p className="max-w-2xl text-sm leading-relaxed mb-5 font-sans font-medium text-stone-700">
                  Completou com êxito e maestria o treinamento intensivo de <strong>Consulta Relacional e
                  Arquitetura de Dados</strong>. O titular demonstrou competência técnica avançada em
                  filtragem complexa, agregadores, subconsultas correlacionadas e otimização de
                  esquemas em <strong>{challengesCompleted} níveis distintos</strong> de desafios práticos.
                </p>

                {/* Info Bar */}
                <div className="grid grid-cols-3 gap-8 w-full py-3 border-y border-amber-900/10">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] uppercase tracking-wider text-amber-900/60 font-bold mb-0.5">Carga Horária</span>
                    <span className="text-lg font-bold text-[#1a1a1a]">40 Horas</span>
                  </div>
                  <div className="flex flex-col items-center px-8 border-x border-amber-900/10">
                    <span className="text-[11px] uppercase tracking-wider text-amber-900/60 font-bold mb-0.5">Data de Emissão</span>
                    <span className="text-lg font-bold text-[#1a1a1a]">{completionDate}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] uppercase tracking-wider text-amber-900/60 font-bold mb-0.5">XP Conquistado</span>
                    <span className="text-lg font-bold text-[#1a1a1a]">{totalXP.toLocaleString()}</span>
                  </div>
                </div>

                {/* Footer / Signatures */}
                <div className="mt-auto w-full flex justify-between items-end px-12 pt-4">
                  <div className="text-left">
                    <div className="font-mono text-[10px] text-stone-500 mb-1 uppercase tracking-tighter">
                      Emissor: SQL QUEST ACADEMY
                    </div>
                    <div className="flex items-center gap-2 text-amber-900/40">
                      <ShieldCheck className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Validado via Blockchain</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center pr-16 relative z-20">
                    <div className="relative">
                      {/* Stylized Signature - Thiago Ramos Duarte */}
                      <span className="font-['Dancing_Script'] text-3xl text-[#1a1a1a]/90 italic select-none block leading-none">
                        Thiago Ramos Duarte
                      </span>
                      <PenTool className="absolute -top-5 -right-5 w-4 h-4 text-amber-600/30 rotate-12" />
                    </div>
                    <div className="h-[1px] w-56 bg-amber-900/40 mt-1 mb-1" />
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-[0.2em] opacity-80">
                      Responsável Técnico / CTO
                    </span>
                  </div>
                </div>
              </div>

              {/* Red Wax Seal Effect */}
              <div className="absolute bottom-12 right-12 w-24 h-24 rotate-12 flex items-center justify-center opacity-90 pointer-events-none select-none z-10">
                <div className="absolute inset-0 bg-[#8b0000] rounded-full blur-[1px] shadow-lg border-2 border-[#5a0000] opacity-30" />
                <div className="relative z-10 w-20 h-20 bg-[#a50000] rounded-full flex items-center justify-center border-4 border-[#8b0000] shadow-inner transform scale-95">
                  <span className="text-amber-200/50 font-mono font-bold text-[10px] text-center leading-tight">
                    SQL<br/>QUEST<br/>OFFICIAL
                  </span>
                </div>
              </div>
            </div>

            {/* BACK SIDE (Syllabus) */}
            <div
              id="digital-certificate-back"
              className="absolute inset-0 w-full h-full backface-hidden bg-[#f4ece0] text-[#1a1a1a] p-1 shadow-2xl overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/handmade-paper.png')]"
              style={{ transform: "rotateY(180deg)", fontFamily: "'Playfair Display', serif" }}
            >
              <div className="absolute inset-8 border border-amber-900/20" />
              
              <div className="relative z-10 h-full flex flex-col p-12 overflow-y-auto custom-scrollbar">
                <h3 className="text-3xl font-bold text-amber-950 mb-8 border-b-2 border-amber-900/10 pb-4 flex items-center gap-3">
                  <Star className="w-6 h-6 text-amber-600 fill-amber-600" />
                  Conteúdo Programático
                </h3>

                <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-sm">
                  {[
                    { t: "Módulo I: Fundamentos e Estruturas", d: "Sintaxe ANSI SQL, tipos de dados, restrições (Primary/Foreign Keys), normalização básica." },
                    { t: "Módulo II: Filtros e Lógica", d: "Cláusulas WHERE, operadores lógicos, predicados LIKE, IN, BETWEEN, tratamento de NULLs." },
                    { t: "Módulo III: Agregações de Dados", d: "Funções de grupo (COUNT, SUM, AVG, MIN, MAX), agrupamento por níveis (GROUP BY, HAVING)." },
                    { t: "Módulo IV: Manipulação Relacional", d: "Junções internas e externas (INNER, LEFT, RIGHT, FULL OUTER JOIN), uniões de conjuntos." },
                    { t: "Módulo V: Subconsultas e CTEs", d: "Subconsultas escalares, correlacionadas, operadores EXISTS e Common Table Expressions." },
                    { t: "Módulo VI: Arquitetura e Performance", d: "Indexação, análise de plano de execução, VIEWS e otimização de consultas complexas." }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <span className="font-bold text-amber-900 uppercase text-[11px] tracking-wider">{item.t}</span>
                      <p className="text-stone-600 font-sans leading-relaxed">{item.d}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 flex justify-between items-end border-t border-amber-900/10">
                  <div className="flex-1">
                    <p className="text-[10px] text-stone-500 uppercase font-bold tracking-widest mb-1 shadow-sm">Verificação Eletrônica</p>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-mono text-[9px] text-amber-900/60 break-all max-w-[280px]">
                        ID: {certificateId}
                      </p>
                      <p className="font-mono text-[8px] text-stone-400 break-all max-w-[280px]">
                        HASH: {btoa(fullName + completionDate + certificateId).slice(0, 40)}
                      </p>
                    </div>
                    
                    <div className="mt-4 flex gap-2 no-print">
                      <div className="px-2 py-1 bg-green-900/10 border border-green-900/20 rounded text-[9px] text-green-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        ASSINATURA DIGITAL VÁLIDA
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 group cursor-help">
                    <div className="w-24 h-24 bg-white p-1 shadow-sm border border-amber-900/10 transition-transform group-hover:scale-110">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + "/verify/" + certificateId)}`} 
                        alt="QR Code de Verificação"
                        className="w-full h-full"
                      />
                    </div>
                    <span className="text-[7px] text-stone-400 font-mono uppercase tracking-tighter">Escanear para Validar</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Controls - Hidden during print */}
        <div className="flex flex-wrap items-center justify-center gap-3 no-print mt-4">
          <Button
            variant="outline"
            onClick={() => setIsFlipped(!isFlipped)}
            className="border-amber-900/50 text-amber-400 hover:bg-amber-950/40 px-6 py-6 rounded-full text-lg shadow-lg group"
          >
            <RotateCcw className={`w-5 h-5 mr-2 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
            {isFlipped ? "Ver Frente" : "Ver Verso (Conteúdo)"}
          </Button>

          <Button
            onClick={handlePrint}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-[#0d0b08] font-bold px-10 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:scale-105 transition-all group"
          >
            <Download className="w-5 h-5 mr-2 group-hover:bounce" />
            Baixar PDF / Imprimir
          </Button>

          <Button
            onClick={handleLinkedInShare}
            className="bg-[#0A66C2] hover:bg-[#004182] text-white font-bold px-8 py-6 rounded-full text-lg shadow-[0_0_20px_rgba(10,102,194,0.3)] hover:scale-105 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 mr-2"
              aria-hidden="true"
            >
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.049c.476-.9 1.637-1.852 3.368-1.852 3.602 0 4.267 2.37 4.267 5.455v6.288zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.777 13.019H3.558V9h3.556v11.452zM22.225 0H1.771C.792 0 0 .775 0 1.729v20.542C0 23.226.792 24 1.771 24h20.451C23.2 24 24 23.226 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            Adicionar ao LinkedIn
          </Button>

          <Button
            variant="ghost"
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 px-6 py-6"
          >
            Sair para o Perfil
          </Button>
        </div>


        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap');
          
          .perspective-1000 { perspective: 1000px; }
          .preserve-3d { transform-style: preserve-3d; }
          /* Container de impressão: escondido em tela, ativado em @media print */
          #certificate-print-root {
            display: none;
          }

          @media print {
            @page {
              size: A4 landscape;
              margin: 0;
            }

            html, body {
              background: white !important;
              margin: 0 !important;
              padding: 0 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Esconde TUDO diretamente no body (React root, overlays, etc.) */
            body > *:not(#certificate-print-root) {
              display: none !important;
            }

            #certificate-print-root {
              display: block !important;
              position: static !important;
              width: 297mm !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              background: white !important;
            }

            /* Cada página clonada vira um A4 landscape completo */
            #certificate-print-root .print-page {
              position: relative !important;
              display: block !important;
              width: 297mm !important;
              height: 210mm !important;
              margin: 0 !important;
              padding: 0 !important;
              inset: auto !important;
              transform: none !important;
              background-color: #f4ece0 !important;
              box-shadow: none !important;
              overflow: hidden !important;
              page-break-after: always !important;
              break-after: page !important;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            #certificate-print-root .print-page:last-child {
              page-break-after: auto !important;
              break-after: auto !important;
            }
          }
          
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(42, 27, 10, 0.05);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(42, 27, 10, 0.2);
            border-radius: 10px;
          }
        `}</style>
      </div>
    </motion.div>
  );
}

