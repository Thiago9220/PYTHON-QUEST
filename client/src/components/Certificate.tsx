import { motion } from "framer-motion";
import { Award, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  fullName: string;
  completionDate: string;
  totalXP: number;
  challengesCompleted: number;
  onClose: () => void;
};

export function Certificate({ fullName, completionDate, totalXP, challengesCompleted, onClose }: Props) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-sky-100"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 to-emerald-50 print:hidden">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Award className="w-5 h-5 text-sky-600" />
            Certificado Python Protocol
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 md:p-12">
          <div className="border-4 border-sky-100 rounded-3xl p-8 md:p-12 text-center bg-gradient-to-br from-white via-sky-50/60 to-emerald-50/70">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-600 text-white flex items-center justify-center mb-8 shadow-lg shadow-sky-900/20">
              <Award className="w-10 h-10" />
            </div>
            <p className="text-sm font-mono uppercase tracking-[0.35em] text-sky-700 mb-4">Python Protocol Academy</p>
            <h1 className="text-4xl md:text-5xl font-black text-slate-950 mb-5">Certificado de Jornada Python</h1>
            <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
              Certificamos que <span className="font-bold text-slate-950">{fullName}</span> concluiu uma jornada de estudos em Python no Arquipelago Aurora, praticando fundamentos, condicoes, repeticoes e funcoes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="bg-white border border-sky-100 rounded-2xl p-4">
                <div className="text-2xl font-black text-sky-700">{challengesCompleted}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500">Desafios</div>
              </div>
              <div className="bg-white border border-sky-100 rounded-2xl p-4">
                <div className="text-2xl font-black text-emerald-700">{totalXP.toLocaleString()}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500">XP</div>
              </div>
              <div className="bg-white border border-sky-100 rounded-2xl p-4">
                <div className="text-2xl font-black text-amber-700">{completionDate}</div>
                <div className="text-xs uppercase tracking-widest text-slate-500">Data</div>
              </div>
            </div>

            <div className="text-left max-w-2xl mx-auto bg-white/80 border border-sky-100 rounded-2xl p-5">
              <h2 className="font-bold text-slate-950 mb-3">Competencias praticadas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                <span>print() e saida no console</span>
                <span>variaveis e operadores</span>
                <span>if / else</span>
                <span>for, range() e funcoes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-sky-100 bg-white flex justify-end gap-3 print:hidden">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button onClick={handlePrint} className="bg-sky-600 hover:bg-sky-700">
            <Download className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
