import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { MasterySectionContent } from "./CodexComponents/MasterySection";
import { 
  X, 
  Book, 
  Database, 
  Terminal, 
  HelpCircle, 
  ChevronRight,
  Info,
  Layout,
  Code2,
  Search,
  Zap,
  Layers,
  MousePointer2,
  Table as TableIcon,
  Check,
  Flame,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSendToEditor?: (code: string) => void;
};

type CodexSection = {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
};

export function Codex({ isOpen, onClose, onSendToEditor }: Props) {
  const [activeTab, setActiveTab] = useState("intro");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Impede que o fundo (WorldMap) role enquanto o Códice está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sqlCommands = [
    { name: "SELECT", desc: "Escolhe quais colunas mostrar.", syntax: "SELECT coluna FROM tabela;", cat: "Básico" },
    { name: "FROM", desc: "Indica a tabela de origem.", syntax: "FROM nome_tabela;", cat: "Básico" },
    { name: "WHERE", desc: "Filtra linhas por condição.", syntax: "WHERE idade > 18;", cat: "Filtro" },
    { name: "ORDER BY", desc: "Ordena os resultados.", syntax: "ORDER BY nome ASC;", cat: "Ordenação" },
    { name: "GROUP BY", desc: "Agrupa registros para cálculos.", syntax: "GROUP BY categoria;", cat: "Agregação" },
    { name: "HAVING", desc: "Filtra grupos (usado com GROUP BY).", syntax: "HAVING COUNT(*) > 5;", cat: "Agregação" },
    { name: "INNER JOIN", desc: "Combina tabelas por chave comum.", syntax: "JOIN tab2 ON u.id = o.uid;", cat: "Relacionamento" },
    { name: "LEFT JOIN", desc: "Traz tudo da esquerda + matches da direita.", syntax: "LEFT JOIN tab2 ON ...;", cat: "Relacionamento" },
    { name: "UPDATE", desc: "Modifica dados existentes.", syntax: "UPDATE tabela SET col = val WHERE ...;", cat: "Manipulação" },
    { name: "DELETE", desc: "Remove registros de uma tabela.", syntax: "DELETE FROM tabela WHERE ...;", cat: "Manipulação" },
    { name: "INSERT", desc: "Adiciona novos registros.", syntax: "INSERT INTO tabela (col) VALUES (val);", cat: "Manipulação" },
    { name: "CREATE TABLE", desc: "Cria uma nova estante (tabela).", syntax: "CREATE TABLE nome (col tipo);", cat: "Definição" },
    { name: "ALTER TABLE", desc: "Modifica a estrutura de uma tabela.", syntax: "ALTER TABLE tab ADD col tipo;", cat: "Definição" },
    { name: "DROP TABLE", desc: "Exclui uma tabela permanentemente.", syntax: "DROP TABLE nome_tabela;", cat: "Definição" },
    { name: "DISTINCT", desc: "Remove valores duplicados.", syntax: "SELECT DISTINCT categoria FROM ...;", cat: "Básico" },
    { name: "LIKE", desc: "Busca padrões de texto.", syntax: "WHERE nome LIKE 'A%';", cat: "Filtro" },
    { name: "IN", desc: "Filtra por uma lista de valores.", syntax: "WHERE id IN (1, 2, 3);", cat: "Filtro" },
    { name: "BETWEEN", desc: "Filtra por um intervalo.", syntax: "WHERE valor BETWEEN 10 AND 50;", cat: "Filtro" },
    { name: "COUNT", desc: "Conta o número de registros.", syntax: "SELECT COUNT(*) FROM ...;", cat: "Agregação" },
    { name: "SUM / AVG", desc: "Soma ou média de valores.", syntax: "SELECT SUM(preco) FROM ...;", cat: "Agregação" },
    { name: "LIMIT", desc: "Limita o número de resultados.", syntax: "LIMIT 10;", cat: "Utilitário" },
  ];

  const firstSteps = [
    {
      title: "O que é SQL?",
      desc: "SQL é a linguagem usada para conversar com bancos de dados. Com ela, você pergunta, filtra, organiza e atualiza informações.",
    },
    {
      title: "Como pensar em uma tabela?",
      desc: "Pense em uma planilha: a tabela guarda um assunto, cada linha é um registro e cada coluna descreve uma característica.",
    },
    {
      title: "O objetivo de uma query",
      desc: "Toda query responde a uma pergunta. Exemplo: quais jogadores têm mais de 100 XP? Qual pedido foi o maior?",
    },
  ];

  const queryFlow = [
    { clause: "SELECT", meaning: "o que você quer ver" },
    { clause: "FROM", meaning: "de qual tabela isso vem" },
    { clause: "WHERE", meaning: "quais regras filtram o resultado" },
    { clause: "ORDER BY", meaning: "como o resultado deve aparecer" },
  ];

  const tableBasics = [
    {
      label: "Tabela",
      desc: "Um conjunto de dados sobre o mesmo tema, como users, products ou orders.",
    },
    {
      label: "Linha",
      desc: "Um registro individual. Em users, uma linha pode representar uma pessoa.",
    },
    {
      label: "Coluna",
      desc: "Uma característica do registro, como nome, email, preço ou data.",
    },
  ];

  const databasePrimer = [
    {
      label: "Banco de dados",
      desc: "É o lugar onde as informações ficam guardadas e organizadas.",
    },
    {
      label: "Tabelas",
      desc: "Dividem os dados por assunto, como users, products ou orders.",
    },
    {
      label: "SQL",
      desc: "É a linguagem usada para consultar, filtrar e atualizar esses dados.",
    },
  ];

  const joinSourceTables = {
    users: [
      { id: "1", name: "Ana" },
      { id: "2", name: "Bruno" },
      { id: "3", name: "Carla" },
    ],
    orders: [
      { id: "900", user_id: "1", total: "R$ 80" },
      { id: "901", user_id: "3", total: "R$ 55" },
    ],
  };

  const joinResultTables = {
    inner: [
      { user: "Ana", order_id: "900" },
      { user: "Carla", order_id: "901" },
    ],
    left: [
      { user: "Ana", order_id: "900" },
      { user: "Bruno", order_id: "NULL" },
      { user: "Carla", order_id: "901" },
    ],
  };

  const starterCommands = ["SELECT", "FROM", "WHERE", "ORDER BY"];

  const glossaryItems = [
    { term: "Banco de dados", def: "O lugar onde várias tabelas ficam organizadas." },
    { term: "Tabela", def: "Um conjunto de registros do mesmo assunto." },
    { term: "Coluna", def: "Um campo da tabela, como nome, preço ou idade." },
    { term: "Linha", def: "Um item salvo dentro da tabela." },
    { term: "Registro", def: "Outro nome para uma linha da tabela." },
    { term: "Resultado", def: "A resposta devolvida pelo banco depois da consulta." },
    { term: "Filtro", def: "Uma regra usada para deixar passar só as linhas desejadas." },
    { term: "Cláusula", def: "Cada bloco da consulta, como SELECT, FROM ou WHERE." },
    { term: "Primary Key", def: "O identificador único de cada linha." },
    { term: "Foreign Key", def: "A coluna que aponta para outra tabela." },
    { term: "Relacionamento", def: "A ligação lógica entre dados de tabelas diferentes." },
    { term: "JOIN", def: "O comando usado para unir tabelas relacionadas." },
  ];

  const masterTips = [
    "A prática constante é o segredo para se tornar um Grandmaster.",
    "Onde houver um JOIN, deve haver um ON para conectar os mundos.",
    "Um SELECT sem WHERE é como um mago sem cajado: perigoso e caótico.",
    "Aliases (AS) são os apelidos sagrados que trazem ordem ao caos.",
    "O ponto e vírgula (;) é o selo final que liberta sua magia SQL.",
    "Sempre olhe o esquema da tabela antes de conjurar sua query.",
    "Cuidado com o DELETE sem filtro; ele pode apagar reinos inteiros."
  ];

  const currentTip = useMemo(() => {
    return masterTips[Math.floor(Math.random() * masterTips.length)];
  }, [isOpen]); // Muda apenas ao abrir

  const learningPath = [
    {
      step: "1",
      title: "Leia a pergunta",
      desc: "Antes de escrever SQL, descubra exatamente o que precisa aparecer na resposta final.",
      className: "from-amber-500 to-amber-700 text-amber-950 shadow-amber-900/30",
    },
    {
      step: "2",
      title: "Ache a tabela certa",
      desc: "Pergunte de onde vem a informação principal. Muitas dúvidas somem quando você acerta a tabela.",
      className: "from-emerald-500 to-emerald-700 text-emerald-950 shadow-emerald-900/30",
    },
    {
      step: "3",
      title: "Monte em blocos",
      desc: "Comece com SELECT + FROM. Depois adicione WHERE e ORDER BY, e só então pense em JOIN ou GROUP BY.",
      className: "from-indigo-500 to-indigo-700 text-indigo-950 shadow-indigo-900/30",
    },
    {
      step: "4",
      title: "Confira o resultado",
      desc: "Rode a query, veja se o retorno responde à pergunta e ajuste com calma.",
      className: "from-orange-500 to-orange-700 text-orange-950 shadow-orange-900/30",
    },
  ];

  const filteredCommands = useMemo(() => {
    return sqlCommands.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.desc.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const sections: CodexSection[] = [
    {
      id: "mastery",
      title: "Caminho do Mestre",
      icon: Award,
      content: <MasterySectionContent />
    },
    {
      id: "intro",
      title: "Caminho do Explorador",
      icon: Terminal,
      content: (
        <div className="space-y-6">
          <div className="relative p-6 rounded-3xl bg-gradient-to-br from-amber-600/10 to-amber-900/10 border border-amber-500/20 overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-3xl rounded-full" />
             <h4 className="text-2xl font-serif font-bold text-amber-100 mb-3 flex items-center gap-2">
               <Book className="w-6 h-6 text-amber-400" /> Domine a Língua dos Dados
             </h4>
             <p className="text-amber-200/80 leading-relaxed text-lg">
               Você embarcou em uma jornada para se tornar um <span className="text-amber-400 font-bold italic">Grão-Mestre do SQL</span>. 
               Aqui, as consultas são suas magias e as tabelas são seus reinos.
             </p>
          </div>

          <div className="rounded-3xl bg-[#0d0b08] border border-amber-900/30 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h5 className="text-base font-bold text-amber-100">Antes do SQL: o que é um banco de dados?</h5>
            </div>
            <p className="text-sm text-amber-200/60 leading-relaxed">
              Pense em um banco de dados como um grande arquivo digital organizado. Ele guarda informações em tabelas para que você consiga encontrar respostas sem procurar tudo manualmente.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {databasePrimer.map((item) => (
                <div key={item.label} className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/20">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-500 mb-2">{item.label}</p>
                  <p className="text-sm text-amber-200/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Exemplo visual de tabela com dados reais */}
            <div className="rounded-2xl overflow-hidden border border-amber-900/30">
              <div className="bg-amber-900/20 px-4 py-2 flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Tabela: users</span>
                <span className="ml-auto text-xs text-amber-700">3 linhas · 4 colunas</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono">
                  <thead className="bg-amber-950/40 text-amber-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 border-b border-amber-900/30">id</th>
                      <th className="px-4 py-2 border-b border-amber-900/30">nome</th>
                      <th className="px-4 py-2 border-b border-amber-900/30">xp</th>
                      <th className="px-4 py-2 border-b border-amber-900/30">mundo_atual</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    <tr className="border-b border-amber-900/10">
                      <td className="px-4 py-2 text-amber-600">1</td>
                      <td className="px-4 py-2 text-amber-100">Ana</td>
                      <td className="px-4 py-2 text-emerald-400">850</td>
                      <td className="px-4 py-2 text-amber-200/60">Biblioteca</td>
                    </tr>
                    <tr className="border-b border-amber-900/10 bg-amber-950/10">
                      <td className="px-4 py-2 text-amber-600">2</td>
                      <td className="px-4 py-2 text-amber-100">Bruno</td>
                      <td className="px-4 py-2 text-emerald-400">320</td>
                      <td className="px-4 py-2 text-amber-200/60">Mercado</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 text-amber-600">3</td>
                      <td className="px-4 py-2 text-amber-100">Carla</td>
                      <td className="px-4 py-2 text-emerald-400">1.200</td>
                      <td className="px-4 py-2 text-amber-200/60">Castelo</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="px-4 py-2 text-xs text-amber-700 bg-amber-950/20 border-t border-amber-900/20">
                Cada linha é um jogador. Cada coluna é uma informação sobre ele.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {firstSteps.map((item) => (
              <div key={item.title} className="p-4 rounded-2xl bg-[#0d0b08] border border-amber-900/30">
                <h5 className="text-base font-bold text-amber-200 mb-2">{item.title}</h5>
                <p className="text-sm text-amber-200/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/30">
              <h5 className="text-amber-300 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Velocidade de Pensamento
              </h5>
              <p className="text-sm text-amber-200/60 leading-relaxed">
                O SQL permite varrer milhões de registros em milissegundos. Aprender a otimizar suas queries é o que separa o aprendiz do especialista.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/30">
              <h5 className="text-amber-300 font-bold mb-2 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Layers className="w-4 h-4" /> Estrutura Inabalável
              </h5>
              <p className="text-sm text-amber-200/60 leading-relaxed">
                Bancos de dados relacionais são a base da internet moderna. Entender como eles se conectam é entender como o mundo digital funciona.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-[#0d0b08] border border-amber-900/30 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-amber-400" />
              <h5 className="text-lg font-bold text-amber-100">Como ler sua primeira query</h5>
            </div>
            <p className="text-base text-amber-200/60 leading-relaxed">
              Pense sempre nesta ordem: pergunta, tabela, colunas, filtro e ordem do resultado.
            </p>
            <div className="rounded-2xl border border-amber-500/10 bg-amber-950/20 p-5">
              <p className="text-sm text-amber-300 mb-4 uppercase tracking-[0.2em] font-mono font-bold">
                Pergunta: quais aventureiros têm mais de 100 XP?
              </p>
              <div className="rounded-xl bg-black/20 border border-amber-900/30 p-4 font-mono text-sm sm:text-base text-amber-200/80 leading-7">
                SELECT name, xp<br />
                FROM users<br />
                WHERE xp &gt; 100<br />
                ORDER BY xp DESC;
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {queryFlow.map((item) => (
                <div key={item.clause} className="flex items-start gap-4 p-4 rounded-2xl bg-amber-950/10 border border-amber-900/20">
                  <ChevronRight className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-mono text-sm font-bold text-amber-300 uppercase">{item.clause}</p>
                    <p className="text-sm text-amber-200/55">{item.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "database",
      title: "Estruturas de Poder",
      icon: Database,
      content: (
        <div className="space-y-6">
          <p className="text-amber-200/80 leading-relaxed">
            As informações no SQL Quest são armazenadas em <span className="text-amber-400 font-bold underline decoration-amber-400/30 underline-offset-4">esquemas relacionais</span>. 
            Visualize como um mapa de conexões:
          </p>

          <p className="text-sm md:text-sm text-amber-200/60 leading-relaxed">
            Em termos simples: o banco de dados é a biblioteca inteira, e cada tabela é uma prateleira com um tipo de informação.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tableBasics.map((item) => (
              <div key={item.label} className="p-4 rounded-2xl bg-[#0d0b08] border border-amber-900/20">
                <p className="text-xs uppercase tracking-[0.2em] text-amber-500 mb-2">{item.label}</p>
                <p className="text-sm md:text-base text-amber-200/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col gap-6 items-center py-4">
            {/* Visual Mini Table Diagram */}
            <div className="w-full max-w-sm bg-[#0d0b08] border border-amber-900/40 rounded-xl overflow-hidden shadow-2xl">
              <div className="bg-amber-900/20 px-3 py-2 text-xs font-mono font-bold text-amber-500 uppercase flex justify-between items-center">
                <span>USERS TABLE</span>
                <TableIcon className="w-4 h-4" />
              </div>
              <div className="p-3 space-y-2">
                <div className="flex gap-2">
                  <div className="w-8 h-7 bg-emerald-500/40 rounded flex items-center justify-center text-[11px] font-bold text-emerald-300 shrink-0">PK</div>
                  <div className="flex-1 h-7 bg-amber-950/50 rounded flex items-center px-2 text-xs font-mono text-amber-400">id [UUID]</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-7 bg-blue-500/20 rounded shrink-0" />
                  <div className="flex-1 h-7 bg-amber-950/50 rounded flex items-center px-2 text-xs font-mono text-amber-200/70">name [TEXT]</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-7 bg-blue-500/20 rounded shrink-0" />
                  <div className="flex-1 h-7 bg-amber-950/50 rounded flex items-center px-2 text-xs font-mono text-amber-200/70">xp [INTEGER]</div>
                </div>
              </div>
            </div>

            <div className="w-px h-8 bg-gradient-to-b from-amber-500 via-amber-500/20 to-transparent relative">
               <div className="absolute bottom-0 -left-1 w-2 h-2 bg-amber-500 rounded-full blur-[2px] animate-pulse" />
            </div>

            <div className="text-xs text-amber-500 font-mono italic opacity-60">"Relacionamentos são pontes entre dados"</div>
          </div>

          <div className="grid grid-cols-1 gap-3">
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0d0b08] border border-amber-900/20 group hover:border-amber-500/30 transition-all">
               <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-300 font-bold shrink-0">PK</div>
               <div>
                  <h6 className="font-bold text-amber-100">Chave Primária (Primary Key)</h6>
                  <p className="text-xs text-amber-200/50">O identificador único de cada registro. Nunca se repete.</p>
               </div>
             </div>
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0d0b08] border border-amber-900/20 group hover:border-amber-500/30 transition-all">
               <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-300 font-bold shrink-0">FK</div>
               <div>
                  <h6 className="font-bold text-amber-100">Chave Estrangeira (Foreign Key)</h6>
                  <p className="text-xs text-amber-200/50">Referência a uma chave em outra tabela. É como o JOIN acontece.</p>
               </div>
             </div>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
            <p className="text-sm text-amber-200/65 leading-relaxed">
              Regra prática: encontre a <span className="text-emerald-300 font-semibold">PK</span> para saber quem identifica cada linha.
              Procure a <span className="text-blue-300 font-semibold">FK</span> quando quiser descobrir como uma tabela se conecta a outra.
            </p>
          </div>
        </div>
      )
    },
    {
      id: "commands",
      title: "Grimório de Comandos",
      icon: Terminal,
      content: (
        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-200/70 leading-relaxed">
              Se você não sabe por onde começar, memorize primeiro estes quatro blocos. Com eles, você resolve boa parte dos desafios iniciais.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {starterCommands.map((cmd) => (
                <Badge
                  key={cmd}
                  variant="outline"
                  className="border-amber-700/40 bg-amber-950/20 text-amber-300 font-mono"
                >
                  {cmd}
                </Badge>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-600/50" />
            <Input 
              placeholder="Buscar comando mágico..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-amber-950/20 border-amber-900/40 text-amber-100 pl-10 h-11 rounded-2xl focus:border-amber-500"
            />
          </div>

          <div className="space-y-4">
            {filteredCommands.map((cmd) => (
              <motion.div 
                key={cmd.name} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative p-5 rounded-3xl bg-[#0d0b08] border border-amber-900/20 hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-amber-500/5"
              >
                <div className="flex items-start justify-between mb-3">
                   <div className="flex flex-col gap-1">
                     <div className="flex items-center gap-3">
                       <span className="font-serif text-xl font-bold text-amber-200 tracking-tight">{cmd.name}</span>
                       <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-amber-500/20 bg-amber-500/5 text-amber-500 font-mono">
                          {cmd.cat}
                       </Badge>
                     </div>
                     <p className="text-sm text-amber-200/50 leading-relaxed">{cmd.desc}</p>
                   </div>
                   <div className="flex gap-2">
                     {onSendToEditor && (
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         onClick={() => onSendToEditor(cmd.syntax)}
                         className="h-8 w-8 text-amber-600 hover:text-amber-400 hover:bg-amber-400/10 rounded-full"
                         title="Enviar para o Editor"
                       >
                         <Zap className="w-3.5 h-3.5" />
                       </Button>
                     )}
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       onClick={() => handleCopy(cmd.syntax, cmd.name)}
                       className="h-8 w-8 text-amber-600 hover:text-amber-400 hover:bg-amber-400/10 rounded-full"
                       title="Copiar SQL"
                     >
                       {copiedId === cmd.name ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <TableIcon className="w-3.5 h-3.5" />}
                     </Button>
                   </div>
                </div>
                
                <div className="relative group/code">
                  <div className="absolute inset-0 bg-amber-400/5 blur-xl group-hover/code:bg-amber-400/10 transition-colors rounded-xl opacity-0 group-hover/code:opacity-100" />
                  <div className="relative bg-black/40 p-4 rounded-2xl font-mono text-sm text-amber-300 border border-amber-900/30 group-hover/code:border-amber-500/20 transition-all overflow-x-auto whitespace-pre">
                    {cmd.syntax}
                  </div>
                </div>
                
                {copiedId === cmd.name && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute top-2 right-12 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-[10px] font-bold uppercase tracking-wider"
                  >
                    Encantamento Copiado!
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "joins",
      title: "A Arte da União (JOINs)",
      icon: Layers,
      content: (
        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 space-y-2">
            <p className="text-sm text-amber-200/70 leading-relaxed">
              Pense assim: <span className="font-mono text-amber-300">users</span> guarda os usuários e <span className="font-mono text-amber-300">orders</span> guarda os pedidos.
            </p>
            <p className="text-sm text-amber-200/70 leading-relaxed">
              O JOIN junta essas tabelas para responder perguntas como: quais usuários fizeram pedidos?
            </p>
          </div>

          <p className="text-amber-200/80 leading-relaxed">
            Quando a resposta está em duas tabelas, você usa JOIN para juntar essas informações. Veja os tipos mais comuns:
          </p>

          <div className="rounded-2xl bg-sky-500/5 border border-sky-500/20 p-4">
            <p className="text-sm text-amber-200/70 leading-relaxed">
              Use JOIN quando você precisa misturar dados de duas tabelas relacionadas.
            </p>
            <p className="text-sm text-amber-200/55 mt-3 leading-relaxed">
              Neste exemplo, <span className="font-mono text-sky-300">users.id</span> identifica o usuário e <span className="font-mono text-sky-300">orders.user_id</span> mostra a quem o pedido pertence.
            </p>
            <div className="mt-3 rounded-xl bg-black/20 border border-sky-500/10 p-3 font-mono text-[11px] text-sky-200/80">
              users.id = orders.user_id
            </div>
            <p className="text-sm text-amber-200/50 mt-3">
              Em outras palavras: o <span className="font-mono text-sky-300">ON</span> mostra quais colunas precisam "bater" para a ligação acontecer.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-[#0d0b08] border border-amber-900/20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-amber-900/10 border-b border-amber-900/20">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500">Tabela 1</p>
                  <p className="font-mono text-sm text-amber-100">users</p>
                </div>
                <TableIcon className="w-4 h-4 text-amber-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-amber-400/80 bg-amber-950/20">
                    <tr>
                      <th className="px-4 py-2 font-medium">id</th>
                      <th className="px-4 py-2 font-medium">name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinSourceTables.users.map((row) => (
                      <tr key={row.id} className="border-t border-amber-900/10 text-amber-200/70">
                        <td className="px-4 py-2">{row.id}</td>
                        <td className="px-4 py-2">{row.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl bg-[#0d0b08] border border-amber-900/20 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 bg-amber-900/10 border-b border-amber-900/20">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500">Tabela 2</p>
                  <p className="font-mono text-sm text-amber-100">orders</p>
                </div>
                <TableIcon className="w-4 h-4 text-amber-400" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="text-amber-400/80 bg-amber-950/20">
                    <tr>
                      <th className="px-4 py-2 font-medium">id</th>
                      <th className="px-4 py-2 font-medium">user_id</th>
                      <th className="px-4 py-2 font-medium">total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinSourceTables.orders.map((row) => (
                      <tr key={row.id} className="border-t border-amber-900/10 text-amber-200/70">
                        <td className="px-4 py-2">{row.id}</td>
                        <td className="px-4 py-2">{row.user_id}</td>
                        <td className="px-4 py-2">{row.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            {/* INNER JOIN Visual */}
            <div className="space-y-3">
               <div className="flex justify-center items-center relative h-32">
                  <div className="w-20 h-20 rounded-full border-2 border-amber-500 bg-amber-500/10 absolute -left-2" />
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-500 bg-emerald-500/10 absolute -right-2" />
                  <div className="w-6 h-10 bg-amber-400 absolute z-10 blur-[15px] opacity-30" />
                  <div className="text-[10px] font-bold text-amber-100 relative z-20 bg-amber-500/20 px-2 py-0.5 rounded backdrop-blur-sm">Só o que bate</div>
               </div>
               <div className="text-center">
                  <h6 className="font-mono text-amber-300 text-xs font-bold uppercase tracking-widest">Inner Join</h6>
                  <p className="text-xs text-amber-200/50 mt-1">Mostra só os registros que existem nas duas tabelas. Ex.: usuários que têm pedidos.</p>
               </div>
            </div>

            {/* LEFT JOIN Visual */}
            <div className="space-y-3">
               <div className="flex justify-center items-center relative h-32">
                  <div className="w-20 h-20 rounded-full border-2 border-amber-500 bg-amber-500 absolute -left-2 opacity-20" />
                  <div className="w-20 h-20 rounded-full border-2 border-emerald-500 bg-emerald-500/10 absolute -right-2" />
                  <div className="text-[10px] font-bold text-amber-100 relative z-20 bg-amber-500/20 px-2 py-0.5 rounded backdrop-blur-sm italic">Tudo de A + se houver B</div>
               </div>
               <div className="text-center">
                  <h6 className="font-mono text-amber-300 text-xs font-bold uppercase tracking-widest">Left Join</h6>
                  <p className="text-xs text-amber-200/50 mt-1">Mostra tudo da primeira tabela, mesmo sem par na segunda. Ex.: todos os usuários, com ou sem pedidos.</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 overflow-hidden">
              <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Resultado</p>
                <p className="font-mono text-sm text-emerald-200">INNER JOIN</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-emerald-950/20 text-emerald-300/90">
                    <tr>
                      <th className="px-4 py-2 font-medium">user</th>
                      <th className="px-4 py-2 font-medium">order_id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinResultTables.inner.map((row, index) => (
                      <tr key={`${row.user}-${index}`} className="border-t border-emerald-500/10 text-amber-200/70">
                        <td className="px-4 py-2">{row.user}</td>
                        <td className="px-4 py-2">{row.order_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-2xl bg-sky-500/5 border border-sky-500/20 overflow-hidden">
              <div className="px-4 py-3 bg-sky-500/10 border-b border-sky-500/10">
                <p className="text-[10px] uppercase tracking-[0.2em] text-sky-300">Resultado</p>
                <p className="font-mono text-sm text-sky-200">LEFT JOIN</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-sky-950/20 text-sky-300/90">
                    <tr>
                      <th className="px-4 py-2 font-medium">user</th>
                      <th className="px-4 py-2 font-medium">order_id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {joinResultTables.left.map((row, index) => (
                      <tr key={`${row.user}-${index}`} className="border-t border-sky-500/10 text-amber-200/70">
                        <td className="px-4 py-2">{row.user}</td>
                        <td className="px-4 py-2">
                          {row.order_id === "NULL" ? (
                            <span className="text-amber-400 italic">NULL</span>
                          ) : (
                            row.order_id
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-4 py-3 text-xs text-amber-200/50 border-t border-sky-500/10">
                Aqui, <span className="font-mono text-amber-300">NULL</span> significa que o usuário não tem pedido correspondente.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
             <p className="text-xs text-amber-400 italic">
               "Se a resposta está dividida em duas tabelas, o JOIN é a ponte entre elas."
             </p>
          </div>
        </div>
      )
    },
    {
      id: "datatypes",
      title: "Essências dos Dados",
      icon: Database,
      content: (
        <div className="space-y-6">
          <p className="text-amber-200/80 leading-relaxed">
            Assim como na alquimia, cada dado possui uma <span className="text-amber-400 font-bold">essência</span> (tipo) que define o que ele pode fazer:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { type: "TEXT / VARCHAR", desc: "Palavras, nomes e pergaminhos.", icon: "abc" },
              { type: "INTEGER / INT", desc: "Números inteiros, sem frações.", icon: "123" },
              { type: "BOOLEAN / BOOL", desc: "Verdadeiro ou Falso. Sim ou Não.", icon: "0/1" },
              { type: "DATE / TIMESTAMP", desc: "Momentos congelados no tempo.", icon: "📅" },
              { type: "UUID / ID", desc: "Identificadores únicos mágicos.", icon: "🔑" },
              { type: "FLOAT / DECIMAL", desc: "Valores com precisão decimal.", icon: "0.5" },
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-xl bg-[#0d0b08] border border-amber-900/20">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] bg-amber-500/10 text-amber-500 px-1.5 rounded font-mono">{t.icon}</span>
                   <span className="font-mono text-sm font-bold text-amber-200">{t.type}</span>
                </div>
                <p className="text-xs text-amber-200/60">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "lore-history",
      title: "História Arcana",
      icon: Book,
      content: (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-600/5 to-transparent border border-amber-500/10 relative overflow-hidden">
             <div className="absolute top-2 right-4 text-4xl opacity-10 font-serif">1970</div>
             <h4 className="text-xl font-serif font-bold text-amber-200 mb-4 italic italic">As Origens</h4>
             <p className="text-sm text-amber-200/60 leading-relaxed">
               O SQL nasceu nos grandes salões da IBM, criado por Donald D. Chamberlin e Raymond F. Boyce. No início, chamava-se <span className="text-amber-500 font-bold">SEQUEL</span>. 
               Ele foi projetado para permitir que humanos comuns pudessem interrogar as máquinas sem precisar falar em códigos binários complexos.
             </p>
             <p className="text-sm text-amber-200/60 leading-relaxed mt-4">
               Hoje, ele é o alicerce de toda a civilização digital. Sem SQL, não haveria bancos, redes sociais ou o próprio SQL Quest.
             </p>
          </div>
        </div>
      )
    },
    {
      id: "glossary",
      title: "Dicionário do Mago",
      icon: Info,
      content: (
        <div className="space-y-4">
          <div className="rounded-2xl bg-amber-950/20 border border-amber-900/30 p-4">
            <p className="text-sm text-amber-200/60 leading-relaxed">
              Este bloco traz os termos mais básicos para quem está começando agora.
            </p>
          </div>

          {glossaryItems.map((item, i) => (
            <div key={`basic-${i}`} className="group p-3 border-b border-amber-900/10 flex flex-col sm:flex-row gap-2 sm:items-baseline">
               <span className="font-mono text-amber-300 font-bold text-sm shrink-0">{item.term}</span>
               <span className="text-amber-200/50 text-sm">- {item.def}</span>
            </div>
          ))}

          {[
            { term: "Schema", def: "A planta arquitetônica do seu banco de dados." },
            { term: "Query", def: "Uma 'pergunta' ou consulta enviada ao banco." },
            { term: "Null", def: "A ausência total de valor. Diferente de zero ou vazio." },
            { term: "Alias (AS)", def: "Um apelido temporário para uma tabela ou coluna." },
            { term: "Constraint", def: "Uma regra que os dados devem seguir (ex: 'não pode ser vazio')." },
            { term: "Index", def: "Um sumário mágico que acelera as buscas no banco." },
          ].map((item, i) => (
            <div key={i} className="group p-3 border-b border-amber-900/10 flex flex-col sm:flex-row gap-2 sm:items-baseline">
               <span className="font-mono text-amber-400 font-bold text-sm shrink-0">{item.term}</span>
               <span className="text-amber-200/40 text-sm">— {item.def}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "lore",
      title: "Domínios do Reino",
      icon: Book,
      content: (
        <div className="space-y-6">
          <p className="text-amber-200/80 leading-relaxed">
            Cada região que você explora no SQL Quest foca em uma técnica específica de manipulação de dados:
          </p>
          <div className="space-y-3">
            {[
              { world: "Biblioteca (Mundo 1)", focus: "Filtros e Consultas Básicas", color: "text-amber-400" },
              { world: "Mercado Central (Mundo 2)", focus: "Agregações e Cálculos (SUM/AVG)", color: "text-orange-400" },
              { world: "Castelo (Mundo 3)", focus: "Joins e Relacionamentos Complexos", color: "text-purple-400" },
              { world: "Nave (Mundo 4)", focus: "Subqueries e Operações Avançadas", color: "text-blue-400" },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-[#0d0b08] border border-amber-900/10 flex justify-between items-center group">
                <span className="font-bold text-amber-100/80 text-sm">{item.world}</span>
                <span className={`text-[10px] font-mono px-2 py-1 bg-white/5 rounded-full ${item.color} uppercase tracking-widest group-hover:bg-white/10 transition-colors`}>{item.focus}</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: "best-practices",
      title: "Artes Proibidas (Dicas)",
      icon: Flame,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl">
              <h6 className="text-red-400 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                <X className="w-4 h-4" /> O Erro de Arcanus
              </h6>
              <p className="text-sm text-amber-200/60 leading-relaxed italic">
                Cuidado ao filtrar! Esquecer um <span className="text-red-400 font-mono">WHERE</span> em um comando de exclusão (DELETE) é a forma mais rápida de apagar um reino inteiro do mapa.
              </p>
            </div>
            
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
              <h6 className="text-emerald-400 font-bold text-xs uppercase mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 ml-1" /> Código Limpo
              </h6>
              <ul className="text-xs text-amber-200/60 space-y-2 list-disc pl-4">
                <li>Sempre use <span className="text-emerald-400">aliases</span> (ex: <code className="bg-emerald-500/10 px-1 rounded">users u</code>) para maior clareza.</li>
                <li>Palavras reservadas (SELECT, FROM) ficam mais legíveis em MAIÚSCULO.</li>
                <li>Evite o <code className="bg-emerald-500/10 px-1 rounded">SELECT *</code>; chame apenas as colunas que você realmente precisa.</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "mechanics",
      title: "Trilha do Mestre",
      icon: HelpCircle,
      content: (
        <div className="space-y-6">
          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4">
            <p className="text-sm text-amber-200/65 leading-relaxed">
              Para quem está no início, esta é a ordem mais segura para resolver um desafio sem travar.
            </p>
          </div>

          <div className="space-y-6">
            {learningPath.map((item) => (
              <div key={item.step} className="flex gap-4 items-start group">
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform ${item.className}`}>
                  {item.step}
                </div>
                <div>
                  <h6 className="font-bold text-amber-100">{item.title}</h6>
                  <p className="text-sm text-amber-200/60 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

           <div className="space-y-6">
            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-amber-950 font-bold shadow-lg shadow-amber-900/30 group-hover:scale-110 transition-transform">1</div>
              <div>
                 <h6 className="font-bold text-amber-100">Resolva Desafios</h6>
                 <p className="text-sm text-amber-200/60 leading-relaxed">Cada missão concluída com código limpo rende mais XP e status no reino.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-emerald-950 font-bold shadow-lg shadow-emerald-900/30 group-hover:scale-110 transition-transform">2</div>
              <div>
                 <h6 className="font-bold text-amber-100">Codifique com Eficiência</h6>
                 <p className="text-sm text-amber-200/60 leading-relaxed">Use o menor número de caracteres possível para ganhar selos de 'Código Otimizado' e subir no Rank.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-indigo-950 font-bold shadow-lg shadow-indigo-900/30 group-hover:scale-110 transition-transform">3</div>
              <div>
                 <h6 className="font-bold text-amber-100">Colecione Títulos</h6>
                 <p className="text-sm text-amber-200/60 leading-relaxed">Conclua mundos inteiros para ganhar títulos raros como 'Grão-Mago' ou 'Lenda das Profundezas'.</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 relative h-1 bg-amber-900/30 rounded-full overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-emerald-500 animate-[shimmer_2s_infinite]" />
          </div>
        </div>
      )
    }
  ];

  const currentSection = sections.find(s => s.id === activeTab) || sections[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60] flex items-center justify-center p-2 sm:p-4 lg:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1917] border border-amber-600/30 rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-full max-h-[85vh]"
          >
            {/* Sidebar de Navegação */}
            <div className="w-full md:w-72 md:shrink-0 bg-[#171412] border-b md:border-b-0 md:border-r border-amber-900/20 p-4 md:p-6 flex flex-col gap-4 md:gap-8">
              <div className="flex items-center justify-between md:justify-start gap-2 md:mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Book className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                  </div>
                  <h2 className="text-xl font-bold font-serif text-amber-100">Códice</h2>
                </div>
                {/* Botão Fechar no Mobile (Visível só em telas pequenas) */}
                <Button variant="ghost" size="icon" onClick={onClose} className="md:hidden text-amber-600/40 hover:text-amber-400">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mobile: select compacto — evita scroll horizontal e mostra tudo de uma vez */}
              <div className="md:hidden relative">
                <select
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                  className="w-full appearance-none bg-amber-950/20 border border-amber-800/40 text-amber-100 text-base font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-amber-500"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id} className="bg-[#1c1917] text-amber-100">
                      {section.title}
                    </option>
                  ))}
                </select>
                <ChevronRight className="w-4 h-4 text-amber-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>

              {/* Desktop: menu vertical */}
              <nav className="hidden md:flex flex-col gap-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === section.id
                        ? "bg-amber-600 text-amber-950 font-bold shadow-lg shadow-amber-900/20"
                        : "text-amber-600/60 hover:text-amber-400 hover:bg-amber-900/10"
                    }`}
                  >
                    <section.icon className="w-4 h-4" />
                    <span className="text-sm whitespace-nowrap">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Dica visível apenas em telas maiores para não ocupar espaço vital no celular */}
              <div className="hidden md:block mt-auto p-4 bg-amber-950/20 rounded-2xl border border-amber-900/30 relative overflow-hidden group/tip">
                <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-amber-500/5 blur-xl rounded-full group-hover/tip:bg-amber-500/10 transition-colors" />
                <p className="text-[10px] text-amber-700 uppercase tracking-widest font-bold mb-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Dica do Mestre
                </p>
                <p className="text-xs text-amber-200/40 leading-relaxed italic relative z-10 transition-colors group-hover/tip:text-amber-200/60">
                  {currentTip}
                </p>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#1c1917]">
              {/* Header do Conteúdo */}
              <div className="flex items-center justify-between p-4 md:p-8 border-b border-amber-900/10">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="hidden md:flex w-12 h-12 bg-amber-500/5 rounded-2xl items-center justify-center border border-amber-500/10">
                    <currentSection.icon className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold font-serif text-amber-100 leading-tight block">{currentSection.title}</h3>
                    <p className="text-[9px] md:text-xs text-amber-600/50 uppercase tracking-[0.2em] font-mono mt-1">Conhecimento Arcano</p>
                  </div>
                </div>
                {/* Botão Fechar no Desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hidden md:flex rounded-xl text-amber-600/40 hover:text-amber-400 hover:bg-amber-900/10"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Área de Texto (Rolagem) */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8 lg:p-10 custom-scrollbar scroll-smooth">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-2xl mx-auto"
                >
                  {currentSection.content}
                </motion.div>
                
                {/* Espaçador extra no final para garantir que o último item não seja cortado */}
                <div className="h-10" />
              </div>
              
              <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                  width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: rgba(0, 0, 0, 0.2);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background: rgba(120, 80, 20, 0.4);
                  border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background: rgba(180, 130, 40, 0.6);
                }
              `}</style>
              
              <div className="p-6 border-t border-amber-900/10 flex justify-end bg-[#171412]/50">
                <Button 
                  onClick={onClose}
                  className="bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold px-8 rounded-xl"
                >
                  Entendido!
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
