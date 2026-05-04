import { useState } from "react";
import { 
  Briefcase, 
  TrendingUp, 
  Zap, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Gauge, 
  Globe,
  Award,
  CircleDollarSign,
  Rocket,
  BrainCircuit,
  Database,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MasterySectionContent() {
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

  const careerData = [
    {
      role: "Data Analyst",
      salary: "R$ 6k - 12k",
      task: "Transformar dados brutos em decisões de negócios usando queries complexas.",
      icon: TrendingUp
    },
    {
      role: "Backend Developer",
      salary: "R$ 7k - 18k",
      task: "Criar APIs eficientes e garantir que o banco responda em milissegundos.",
      icon: Layers
    },
    {
      role: "Data Engineer",
      salary: "R$ 9k - 25k+",
      task: "Construir os 'oleodutos' que movem petabytes de dados entre sistemas.",
      icon: Gauge
    }
  ];

  const advancedTopics = [
    {
      id: "acid",
      title: "Propriedades ACID",
      concept: "O seguro de vida dos seus dados. Sem ACID, um erro de banco pode apagar saldos bancários ou duplicar pedidos.",
      icon: ShieldCheck,
      details: [
        { label: "Atomicidade", text: "Princípio do 'Tudo ou Nada'. Se uma transferência bancária sai de uma conta mas não entra na outra, o SQL desfaz tudo automaticamente." },
        { label: "Consistência", text: "O banco garante que as regras de integridade (como chaves estrangeiras) nunca sejam quebradas, mantendo a 'verdade' dos dados." },
        { label: "Isolamento", text: "Mesmo com milhares de pessoas comprando o mesmo item, o banco garante que cada transação aconteça como se estivesse sozinha." },
        { label: "Durabilidade", text: "Uma vez que o banco diz 'Sucesso', a informação é gravada em disco de forma permanente, suportando até quedas de energia." }
      ]
    },
    {
      id: "indexes",
      title: "Índices & Performance",
      concept: "O segredo por trás da velocidade. Um índice é como o sumário de um livro: você não precisa ler todas as páginas para achar um capítulo.",
      icon: Gauge,
      details: [
        { label: "B-Trees", text: "A estrutura padrão. Organiza dados de forma que o banco encontra qualquer registro em apenas 3 ou 4 saltos, mesmo em bilhões de linhas." },
        { label: "Hash Indexes", text: "Ultra-velozes para buscas exatas (ex: buscar um ID específico), funcionando quase instantaneamente através de cálculos matemáticos." },
        { label: "Full-text Search", text: "Permite buscas complexas em textos longos, ignorando 'de/e/o' e encontrando palavras por similaridade sonora ou radical." }
      ]
    },
    {
      id: "architecture",
      title: "Escalabilidade & Sharding",
      concept: "Como o SQL sobrevive ao tráfego de bilhões de usuários simultâneos em sistemas mundiais.",
      icon: Globe,
      details: [
        { label: "Replicação", text: "Copia os dados para vários servidores. Se um servidor queimar, o outro assume imediatamente sem o usuário perceber." },
        { label: "Sharding", text: "Divide uma tabela gigante em 'pedaços' menores espalhados por vários computadores, permitindo crescimento infinito." },
        { label: "Teorema CAP", text: "O dilema supremo: você precisa escolher dois entre Disponibilidade, Consistência ou Tolerância a Partições." }
      ]
    },
    {
      id: "nosql",
      title: "SQL vs NoSQL",
      concept: "Nem tudo é tabela. Entenda quando as 'Relíquias Antigas' (SQL) ganham das 'Novas Artes' (NoSQL).",
      icon: Layers,
      details: [
        { label: "SQL (Relacional)", text: "Perfeito para dados estruturados, transações financeiras e consultas complexas que exigem precisão absoluta." },
        { label: "NoSQL (Documento)", text: "Ideal para rapidez de desenvolvimento, dados flexíveis (JSON) e altíssima escala de escrita (ex: logs, chats)." },
        { label: "Quando Escolher?", text: "Se o dado tem relações complexas e exige ACID, vá de SQL. Se o dado é simples mas o volume é absurdo, NoSQL pode ser a saída." },
        { label: "Híbrido", text: "Grandes Mestres usam ambos: SQL para o coração do negócio e NoSQL para cache e buscas em tempo real." }
      ]
    }
  ];

  return (
    <div className="space-y-12">
      {/* Carrer Section */}
      <section className="space-y-8">
        <div className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-900/10 border border-indigo-500/20 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-32 h-32" />
          </div>
          <h3 className="text-2xl font-serif font-bold text-amber-100 mb-4 flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-400" /> O Mercado Real
          </h3>
          <p className="text-amber-200/70 leading-relaxed text-lg max-w-2xl">
            Sua jornada no SQL Quest abre portas para carreiras sólidas e bem remuneradas. O SQL é a 2ª linguagem mais usada no mundo por uma razão: <span className="text-amber-400 font-bold">os dados são o novo petróleo.</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {careerData.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className="p-6 rounded-2xl bg-[#0d0b08] border border-amber-900/20 hover:border-amber-500/30 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-amber-600/50 block">Média Salarial</span>
                  <span className="text-emerald-400 font-bold font-mono">{item.salary}</span>
                </div>
              </div>
              <h4 className="text-amber-100 font-bold mb-2">{item.role}</h4>
              <p className="text-xs text-amber-200/50 leading-relaxed">{item.task}</p>
            </motion.div>
          ))}
        </div>

        {/* Productivity Comparison */}
        <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-900/30">
          <h4 className="text-amber-300 font-bold mb-4 flex items-center gap-2 text-base uppercase tracking-widest">
            <Zap className="w-4 h-4 text-amber-400" /> Produtividade: Excel vs SQL
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2 opacity-60">
              <span className="text-xs font-mono text-red-400 uppercase tracking-widest">Cenário Comum (Excel)</span>
              <p className="text-sm text-amber-200/70 leading-relaxed">
                Abrir arquivo de 500MB, esperar 30s para carregar, aplicar 5 filtros manuais, o computador trava, você reinicia. <span className="font-bold font-serif">Tempo Gasto: 15 min.</span>
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Cenário Mestre (SQL)</span>
              <p className="text-sm text-amber-100 leading-relaxed">
                Escrever 4 linhas de código, rodar a query, receber o resultado exato em milissegundos, automatizar para o dia seguinte. <span className="font-bold text-amber-400 font-serif">Tempo Gasto: 20s.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section className="space-y-8">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-serif font-bold text-amber-100 flex items-center gap-3">
            <BrainCircuit className="w-7 h-7 text-amber-400" /> Profundezas do Conhecimento
          </h3>
          <p className="text-amber-200/50 text-sm">Clique nos tópicos para expandir o conhecimento arcano.</p>
        </div>

        <div className="space-y-4">
          {advancedTopics.map((topic, i) => (
            <motion.div
              key={topic.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                expandedTopic === topic.id 
                  ? "bg-amber-950/20 border-amber-500/50 shadow-[0_0_20px_rgba(251,191,36,0.1)]" 
                  : "bg-[#0d0b08] border-amber-900/30 hover:border-amber-500/30"
              }`}
            >
              <button 
                onClick={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                className="w-full p-6 flex flex-col md:flex-row md:items-center justify-between text-left gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl transition-colors ${expandedTopic === topic.id ? "bg-amber-500 text-amber-950" : "bg-amber-950/40 text-amber-500"}`}>
                    <topic.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-amber-100">{topic.title}</h4>
                    <p className="text-sm text-amber-100/40 max-w-md">{topic.concept}</p>
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-amber-700 transition-transform duration-300 ${expandedTopic === topic.id ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {expandedTopic === topic.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-amber-500/10"
                  >
                    <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {topic.details.map((detail, di) => (
                        <div key={di} className="space-y-2 relative pl-6">
                          <div className="absolute left-0 top-1 w-1 h-3 bg-amber-500 rounded-full" />
                          <h5 className="text-sm font-bold text-amber-400 uppercase tracking-widest">{detail.label}</h5>
                          <p className="text-sm text-amber-200/60 leading-relaxed">{detail.text}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="px-8 pb-8 flex justify-end">
                       <div className="flex items-center gap-2 text-[10px] font-mono text-amber-600/40 uppercase tracking-tighter">
                          Domínio Técnico Elevado <ArrowRight className="w-3 h-3" />
                       </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="p-8 rounded-3xl bg-amber-500/5 border border-dashed border-amber-500/20 text-center">
          <Database className="w-10 h-10 text-amber-600 mx-auto mb-4" />
          <h4 className="text-amber-100 font-bold mb-2">A Jornada Continua</h4>
          <p className="text-sm text-amber-200/60 max-w-md mx-auto mb-6 leading-relaxed">
            O SQL é apenas a porta de entrada. O universo de dados engloba <span className="text-amber-400">Big Data</span>, <span className="text-amber-400">Machine Learning</span> e <span className="text-amber-400">Inteligência Artificial</span>.
          </p>
          <p className="text-[10px] text-amber-700 font-mono uppercase tracking-[0.4em]">Estude • Pratique • Domine</p>
        </div>
      </section>
    </div>
  );
}


export function QuickMasteryCard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-amber-100 text-sm">Alta Demanda</h4>
        </div>
        <p className="text-xs text-amber-200/50 leading-relaxed">
          O mercado de dados cresce 25% ao ano. Quem domina SQL está no centro das decisões estratégicas.
        </p>
      </div>
      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-center gap-3 mb-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <h4 className="font-bold text-amber-100 text-sm">Produtividade</h4>
        </div>
        <p className="text-xs text-amber-200/50 leading-relaxed">
          Substitua horas de trabalho manual por segundos de processamento automatizado. Seja o "Power User" da sua equipe.
        </p>
      </div>
    </div>
  );
}
