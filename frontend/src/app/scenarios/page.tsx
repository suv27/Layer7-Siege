'use client';

import { useState, useEffect } from 'react';
import { Scenario, Rule, SimulationScore } from '../../types';
import { Shield, Target, Zap, Play, Square, Clock } from 'lucide-react';
import TrafficVisualizer from '../../components/TrafficVisualizer';
import RuleBuilder from '../../components/RuleBuilder';
import ResultsPanel from '../../components/ResultsPanel';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [score, setScore] = useState<SimulationScore>({
    totalRequests: 0,
    attacksBlocked: 0,
    attacksMissed: 0,
    benignAllowed: 0,
    benignBlocked: 0,
    accuracy: 0,
  });
  const [isComplete, setIsComplete] = useState(false);

  const fetchScenarios = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/scenarios`);
      if (!response.ok) {
        throw new Error(`Scenario API returned ${response.status}`);
      }
      const data = await response.json();
      setScenarios(data.scenarios);
      setLoadError(null);
    } catch (error) {
      console.error('Failed to fetch scenarios:', error);
      setLoadError('Unable to load scenarios. Start the backend on port 3001 and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const selectScenario = async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setRules(scenario.defaultRules);
    setIsComplete(false);
    setScore({
      totalRequests: 0,
      attacksBlocked: 0,
      attacksMissed: 0,
      benignAllowed: 0,
      benignBlocked: 0,
      accuracy: 0,
    });
    setTimeRemaining(scenario.duration);
  };

  const startSimulation = async () => {
    if (!selectedScenario) return;

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/simulation/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          rules,
        }),
      });

      if (response.ok) {
        setIsRunning(true);
        setIsComplete(false);
        
        // Start timer
        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              stopSimulation();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to start simulation:', error);
    }
  };

  const stopSimulation = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await fetch(`${API_URL}/api/simulation/stop`, {
        method: 'POST',
      });
      setIsRunning(false);
      setIsComplete(true);
    } catch (error) {
      console.error('Failed to stop simulation:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'OWASP':
        return <Target size={20} />;
      case 'BOT':
        return <Shield size={20} />;
      case 'DDOS':
        return <Zap size={20} />;
      default:
        return <Shield size={20} />;
    }
  };

  if (!selectedScenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Select a Scenario</h1>
          <p className="text-slate-400 mb-8">Choose a security scenario to test your WAF configuration skills</p>

          {isLoading && <p className="text-slate-400">Loading scenarios...</p>}
          {loadError && <p className="text-red-400">{loadError}</p>}
          {!isLoading && !loadError && scenarios.length === 0 && (
            <p className="text-slate-400">No scenarios are available.</p>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {scenarios.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => selectScenario(scenario)}
                className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-blue-400">{getCategoryIcon(scenario.category)}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{scenario.name}</h3>
                      <p className="text-sm text-slate-400">{scenario.category}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(scenario.difficulty)}`}>
                    {scenario.difficulty}
                  </span>
                </div>
                <p className="text-slate-300 mb-4">{scenario.description}</p>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock size={16} />
                    <span>{scenario.duration}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={16} />
                    <span>{Math.round(scenario.attackRatio * 100)}% attacks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => setSelectedScenario(null)}
              className="text-slate-400 hover:text-white mb-2 text-sm"
            >
              ← Back to scenarios
            </button>
            <h1 className="text-3xl font-bold text-white">{selectedScenario.name}</h1>
            <p className="text-slate-400">{selectedScenario.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${timeRemaining <= 10 ? 'text-red-400' : 'text-white'}`}>
                {timeRemaining}s
              </div>
              <div className="text-xs text-slate-400">Remaining</div>
            </div>
            <button
              onClick={isRunning ? stopSimulation : startSimulation}
              disabled={isComplete}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isRunning ? <Square size={20} /> : <Play size={20} />}
              {isRunning ? 'Stop' : 'Start'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <TrafficVisualizer isSimulationRunning={isRunning} />
            <ResultsPanel score={score} isComplete={isComplete} />
          </div>
          <div>
            <RuleBuilder rules={rules} onRulesChange={setRules} disabled={isRunning} />
          </div>
        </div>
      </div>
    </div>
  );
}
