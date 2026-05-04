import React, { useState, useEffect } from 'react';
import { initPython, runPythonCode, validatePythonChallenge } from '../lib/pythonEngine';
import { Challenge } from '../lib/types';

interface PythonEditorProps {
  challenge: Challenge;
  onSuccess: (xp: number) => void;
}

export const PythonEditor: React.FC<PythonEditorProps> = ({ challenge, onSuccess }) => {
  const [code, setCode] = useState(challenge.starterCode);
  const [output, setOutput] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    initPython().then(() => setIsReady(true));
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    const result = await runPythonCode(code, challenge.setupCode);
    setOutput(result.success ? result.output : `Erro: ${result.error}`);
    setIsRunning(false);
  };

  const handleSubmit = async () => {
    setIsRunning(true);
    const validation = await validatePythonChallenge(code, challenge);
    setOutput(validation.output);
    
    if (validation.correct) {
      onSuccess(challenge.xpReward);
    } else {
      alert(validation.feedback);
    }
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-slate-900 text-white rounded-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">{challenge.title}</h3>
        {!isReady && <span className="text-yellow-500">Carregando Python...</span>}
      </div>
      
      <textarea
        className="font-mono p-4 bg-slate-800 rounded border border-slate-700 h-48"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        disabled={!isReady || isRunning}
      />

      <div className="flex gap-2">
        <button 
          onClick={handleRun}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          disabled={!isReady || isRunning}
        >
          Rodar Código
        </button>
        <button 
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          disabled={!isReady || isRunning}
        >
          Enviar Solução
        </button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm uppercase text-slate-400">Saída:</h4>
        <pre className="p-2 bg-black rounded mt-1 min-h-[50px]">{output}</pre>
      </div>
    </div>
  );
};
