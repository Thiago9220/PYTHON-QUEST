import { useState } from 'react';
import { WORLDS } from './lib/challenges';
import { PythonEditor } from './components/PythonEditor';
import { Challenge } from './lib/types';

function App() {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [xp, setXp] = useState(0);

  const handleSuccess = (reward: number) => {
    setXp(prev => prev + reward);
    alert(`Parabéns! Você ganhou ${reward} XP!`);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 p-8">
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-blue-500">🐍 PYTHON-QUEST</h1>
          <p className="text-slate-400">Domine a serpente, conquiste o código.</p>
        </div>
        <div className="bg-slate-800 px-6 py-3 rounded-full border border-blue-500/30">
          <span className="text-blue-400 font-mono font-bold">XP: {xp}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: Lista de Mundos e Desafios */}
        <div className="lg:col-span-1 space-y-6">
          {WORLDS.map(world => (
            <div key={world.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: world.color }}>
                {world.title}
              </h2>
              <div className="space-y-2">
                {world.challenges.map(challenge => (
                  <button
                    key={challenge.id}
                    onClick={() => setCurrentChallenge(challenge)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentChallenge?.id === challenge.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {challenge.title}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Arena: Editor e Narrativa */}
        <div className="lg:col-span-2">
          {currentChallenge ? (
            <div className="space-y-6">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h2 className="text-2xl font-bold text-white mb-2">{currentChallenge.title}</h2>
                <p className="text-slate-300 italic mb-4">"{currentChallenge.narrative}"</p>
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
                  <p className="text-blue-200">{currentChallenge.description}</p>
                </div>
              </div>

              <PythonEditor 
                challenge={currentChallenge} 
                onSuccess={handleSuccess} 
              />

              <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-lg font-bold text-white mb-2">Conceito: {currentChallenge.concept}</h3>
                <p className="text-slate-400 whitespace-pre-line">{currentChallenge.conceptExplanation}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-900/50 rounded-xl border border-dashed border-slate-800 p-12 text-center">
              <div>
                <p className="text-slate-500 text-xl mb-4">Selecione um desafio para começar sua jornada.</p>
                <div className="text-6xl opacity-20">🐍</div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
