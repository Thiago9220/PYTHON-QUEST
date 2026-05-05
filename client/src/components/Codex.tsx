import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Code2, Copy, Play, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendToEditor?: (code: string) => void;
};

type Entry = {
  title: string;
  category: string;
  description: string;
  code: string;
};

const ENTRIES: Entry[] = [
  {
    title: "print()",
    category: "Saida",
    description: "Mostra textos, numeros ou valores de variaveis no console.",
    code: "print('Ola, Python!')",
  },
  {
    title: "Variaveis",
    category: "Fundamentos",
    description: "Guardam valores para uso posterior. O nome fica a esquerda do sinal de igual.",
    code: "nome = 'Python'\nprint(nome)",
  },
  {
    title: "Numeros e soma",
    category: "Fundamentos",
    description: "Python pode calcular com operadores aritmeticos como +, -, * e /.",
    code: "a = 5\nb = 10\nprint(a + b)",
  },
  {
    title: "if",
    category: "Condicoes",
    description: "Executa um bloco apenas quando a condicao e verdadeira.",
    code: "idade = 20\nif idade >= 18:\n    print('Acesso Permitido')",
  },
  {
    title: "if/else",
    category: "Condicoes",
    description: "Cria um caminho alternativo quando a condicao principal e falsa.",
    code: "energia = 30\nif energia > 50:\n    print('Correr')\nelse:\n    print('Descansar')",
  },
  {
    title: "for e range()",
    category: "Repeticao",
    description: "Repete uma tarefa para cada item de uma sequencia.",
    code: "for i in range(5):\n    print(i)",
  },
  {
    title: "Funcoes",
    category: "Organizacao",
    description: "Agrupam codigo reutilizavel sob um nome.",
    code: "def saudar(nome):\n    print(f'Ola, {nome}!')\n\nsaudar('Mestre')",
  },
  {
    title: "Listas",
    category: "Colecoes",
    description: "Guardam varios valores em uma unica variavel.",
    code: "frutas = ['maca', 'banana', 'uva']\nprint(frutas[0])",
  },
];

export function Codex({ isOpen, onClose, onSendToEditor }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");

  useEffect(() => {
    if (!isOpen) return;
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen]);

  const categories = useMemo(() => ["Todos", ...Array.from(new Set(ENTRIES.map((entry) => entry.category)))], []);
  const filtered = ENTRIES.filter((entry) => {
    const matchesCategory = category === "Todos" || entry.category === category;
    const q = query.toLowerCase();
    const matchesQuery =
      entry.title.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.code.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Exemplo copiado.");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 18, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 18, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-dark border border-white/10 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col bg-slate-900/95 backdrop-blur-xl"
          >
            <div className="p-5 md:p-7 border-b border-white/5 flex items-center justify-between bg-slate-950/40 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 bg-sky-500/10 rounded-2xl flex items-center justify-center border border-sky-500/20 shrink-0">
                  <BookOpen className="w-6 h-6 text-sky-400" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl md:text-2xl font-black text-white truncate">Guia Python</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Sintaxe essencial para os desafios</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl text-slate-500 hover:text-white hover:bg-white/5">
                <X className="w-6 h-6" />
              </Button>
            </div>

            <div className="p-4 md:p-6 border-b border-white/5 bg-slate-950/20 shrink-0">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar rituais: print, if, for..."
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-sky-500 rounded-xl"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${
                        category === item
                          ? "bg-sky-600 text-white border-sky-500 shadow-lg shadow-sky-900/20"
                          : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((entry) => (
                  <div key={entry.title} className="border border-white/10 rounded-2xl bg-slate-900/60 shadow-xl overflow-hidden group hover:border-white/20 transition-all">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-400">{entry.category}</span>
                          <h3 className="text-xl font-black text-white mt-1 group-hover:text-sky-300 transition-colors">{entry.title}</h3>
                        </div>
                        <Code2 className="w-5 h-5 text-sky-500/50 shrink-0 group-hover:text-sky-400 transition-colors" />
                      </div>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed mb-5">{entry.description}</p>
                      <pre className="bg-slate-950 border border-white/5 text-sky-100 rounded-xl p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono selection:bg-sky-500/30">
                        {entry.code}
                      </pre>
                    </div>
                    <div className="px-6 py-4 bg-slate-950/40 border-t border-white/5 flex justify-end gap-3">
                      <Button variant="ghost" size="sm" onClick={() => copyCode(entry.code)} className="text-slate-400 hover:text-white hover:bg-white/5 font-bold">
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                      {onSendToEditor && (
                        <Button size="sm" onClick={() => onSendToEditor(entry.code)} className="bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-widest text-[10px] px-4 rounded-lg shadow-lg shadow-sky-900/20">
                          <Play className="w-4 h-4 mr-2" />
                          Injetar Código
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
