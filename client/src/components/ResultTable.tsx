/**
 * SQL Quest — Tabela de Resultados
 * Design: Dark Academia / Terminal Moderno
 */

import { motion, AnimatePresence } from "framer-motion";
import { type QueryResult } from "@/lib/sqlEngine";
import { AlertCircle, CheckCircle2, Clock, Table2 } from "lucide-react";

type Props = {
  result: QueryResult | null;
  isCorrect?: boolean | null;
  feedback?: string;
  liveError?: string | null;
};

export default function ResultTable({ result, isCorrect, feedback, liveError }: Props) {
  if (!result && !liveError) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-amber-800/40">
        <Table2 className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-mono text-sm">Escreva ou execute uma query para ver os resultados</p>
      </div>
    );
  }

  const errorToShow = liveError || (result && !result.success ? result.error : null);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={(result ? JSON.stringify(result) : "no-res") + (errorToShow || "")}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-3"
      >
        {/* Mensagem de Erro (seja liveError ou da execução atual/anterior) */}
        {errorToShow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-3 p-4 bg-red-950/30 border border-red-800/40 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-red-300 font-semibold text-sm mb-1">Erro na Query</div>
              <div className="text-red-400/80 font-mono text-sm">{errorToShow}</div>
            </div>
          </motion.div>
        )}

        {/* Feedback de correção (Somente se não houver erro e tivermos feedback) */}
        {!errorToShow && feedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-start gap-3 p-4 rounded-xl border ${
              isCorrect
                ? "bg-emerald-950/30 border-emerald-700/40"
                : "bg-amber-950/30 border-amber-700/40"
            }`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <div
                className={`font-semibold text-sm mb-0.5 ${
                  isCorrect ? "text-emerald-300" : "text-amber-300"
                }`}
              >
                {isCorrect ? "Correto!" : "Quase lá..."}
              </div>
              <div
                className={`text-sm ${
                  isCorrect ? "text-emerald-400/70" : "text-amber-400/70"
                }`}
              >
                {feedback}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabela de Dados */}
        {!result || !result.success ? (
          !result && errorToShow ? (
            <div className="flex flex-col items-center justify-center py-6 text-amber-800/40">
              <Table2 className="w-8 h-8 mb-2 opacity-30" />
              <p className="font-mono text-sm">Aguardando query válida para exibição de dados</p>
            </div>
          ) : null
        ) : (
          <>
            <div className="flex items-center gap-4 text-sm font-mono text-amber-700/60">
              <span className="flex items-center gap-1">
                <Table2 className="w-3 h-3" />
                {result.rowCount ?? 0} linha{result.rowCount !== 1 ? "s" : ""}
              </span>
              {result.executionTime !== undefined && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {result.executionTime.toFixed(1)}ms
                </span>
              )}
            </div>

            {result.columns && result.columns.length > 0 ? (
              <div className="overflow-auto rounded-xl border border-amber-900/30 max-h-64">
                <table className="w-full text-sm font-mono">
                  <thead>
                    <tr className="bg-amber-950/50">
                      {result.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2.5 text-left text-amber-400 font-semibold text-sm uppercase tracking-wider border-b border-amber-900/30 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows?.map((row, ri) => (
                      <motion.tr
                        key={ri}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: ri * 0.03, duration: 0.2 }}
                        className="border-b border-amber-950/30 hover:bg-amber-950/20 transition-colors"
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-4 py-2 text-amber-200/80 whitespace-nowrap"
                          >
                            {cell === null ? (
                              <span className="text-amber-800/50 italic">NULL</span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-amber-700/50 font-mono text-sm">
                Query executada com sucesso (sem linhas retornadas)
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
