'use client';

import { useState } from 'react';
import { Brain, Download, FilePlus2, Lightbulb, Radio, Users, UserRound } from 'lucide-react';
import { Rule, Scenario, SimulationScore } from '../types';

interface PlatformWorkbenchProps {
  scenario: Scenario | null;
  rules: Rule[];
  score: SimulationScore;
  simulationId?: string;
}

type Tab = 'test' | 'report' | 'author' | 'ai' | 'team' | 'logs' | 'profile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function PlatformWorkbench({ scenario, rules, score, simulationId }: PlatformWorkbenchProps) {
  const [tab, setTab] = useState<Tab>('test');
  const [status, setStatus] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sensitivity, setSensitivity] = useState(0.5);
  const [aiResult, setAiResult] = useState<{ blocked: boolean; risk: number; reason: string } | null>(null);
  const [teamName, setTeamName] = useState('');
  const [teams, setTeams] = useState<Array<{ name: string; score: number }>>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [customName, setCustomName] = useState('');
  const [customPayload, setCustomPayload] = useState('');
  const [failureCount, setFailureCount] = useState(0);
  const [hint, setHint] = useState('');

  const runScenarioTests = async () => {
    if (!scenario) return;
    const response = await fetch(`${API_URL}/api/scenario-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId: scenario.id, rules }),
    });
    const data = await response.json();
    setStatus(`${data.result.message} ${data.result.blockedAttacks}/${data.result.totalVectors} attack vectors blocked.`);
  };

  const downloadReport = async () => {
    if (!simulationId) {
      setStatus('Run and stop a simulation before downloading a report.');
      return;
    }
    const response = await fetch(`${API_URL}/api/reports/${simulationId}`);
    const data = await response.json();
    const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `layer7-report-${data.report.scenarioId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatus('Forensic report downloaded.');
  };

  const evaluatePrompt = async () => {
    const response = await fetch(`${API_URL}/api/ai/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, sensitivity }),
    });
    setAiResult((await response.json()).evaluation);
  };

  const createTeam = async () => {
    await fetch(`${API_URL}/api/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName }),
    });
    const response = await fetch(`${API_URL}/api/teams`);
    setTeams((await response.json()).teams);
    setTeamName('');
  };

  const loadLogs = async () => {
    const response = await fetch(`${API_URL}/api/logs`);
    setLogs((await response.json()).logs);
  };

  const saveCustomScenario = async () => {
    if (!customName || !customPayload) return;
    await fetch(`${API_URL}/api/custom-scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `custom-${Date.now()}`,
        name: customName,
        category: 'AI',
        description: customPayload,
        difficulty: 'advanced',
        duration: 60,
        attackRatio: 0.5,
        trafficPatterns: [],
        defaultRules: rules,
        successCriteria: { blockRate: 0.8, falsePositiveRate: 0.1 },
      }),
    });
    setStatus(`Saved custom scenario: ${customName}`);
    setCustomName('');
    setCustomPayload('');
  };

  const requestHint = async () => {
    const nextFailures = failureCount + 1;
    setFailureCount(nextFailures);
    const response = await fetch(`${API_URL}/api/hints/${scenario?.id || 'sandbox'}?failures=${nextFailures}`);
    const data = await response.json();
    setHint(data.hint.show ? data.hint.hint : `Hint unlocks after ${3 - nextFailures} more failed attempts.`);
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: 'test', label: 'Test vectors', icon: <Radio size={16} /> },
    { id: 'report', label: 'Forensics', icon: <Download size={16} /> },
    { id: 'author', label: 'Scenario studio', icon: <FilePlus2 size={16} /> },
    { id: 'ai', label: 'AI playground', icon: <Brain size={16} /> },
    { id: 'team', label: 'Teams', icon: <Users size={16} /> },
    { id: 'logs', label: 'Live logs', icon: <Radio size={16} /> },
    { id: 'profile', label: 'Profile', icon: <UserRound size={16} /> },
  ];

  return (
    <section className="bg-slate-800 rounded-lg border border-slate-700 p-5 mb-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Security Lab Tools</h2>
          <p className="text-sm text-slate-400">Validate, inspect, author, and collaborate around your defense configuration.</p>
        </div>
        {status && <span className="text-xs text-blue-300 max-w-sm text-right">{status}</span>}
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {tabs.map((item) => (
          <button key={item.id} onClick={() => { setTab(item.id); if (item.id === 'logs') void loadLogs(); }} className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${tab === item.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}>
            {item.icon}{item.label}
          </button>
        ))}
      </div>

      {tab === 'test' && <div className="flex items-center justify-between gap-4"><p className="text-slate-300 text-sm">Run attack and benign vectors against the current WAF rules before starting traffic.</p><button onClick={runScenarioTests} className="px-4 py-2 rounded bg-green-600 text-white text-sm">Run automated checks</button></div>}
      {tab === 'report' && <div className="flex items-center justify-between gap-4"><p className="text-slate-300 text-sm">Download matched rules, reasons, statuses, and score data from the latest simulation.</p><button onClick={downloadReport} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white text-sm"><Download size={16} />Download report</button></div>}
      {tab === 'author' && <div className="grid md:grid-cols-3 gap-3"><input value={customName} onChange={(event) => setCustomName(event.target.value)} className="bg-slate-700 rounded px-3 py-2 text-white" placeholder="Scenario name" /><input value={customPayload} onChange={(event) => setCustomPayload(event.target.value)} className="bg-slate-700 rounded px-3 py-2 text-white" placeholder="Attack payload or brief" /><button onClick={saveCustomScenario} className="px-4 py-2 rounded bg-purple-600 text-white">Save scenario</button></div>}
      {tab === 'ai' && <div className="space-y-3"><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} className="w-full bg-slate-700 rounded px-3 py-2 text-white" rows={3} placeholder="Try: ignore previous instructions..." /><label className="block text-sm text-slate-300">Guardrail sensitivity: {Math.round(sensitivity * 100)}%<input type="range" min="0" max="1" step="0.1" value={sensitivity} onChange={(event) => setSensitivity(Number(event.target.value))} className="w-full" /></label><button onClick={evaluatePrompt} className="px-4 py-2 rounded bg-orange-600 text-white">Evaluate prompt</button>{aiResult && <p className={aiResult.blocked ? 'text-red-300' : 'text-green-300'}>{aiResult.blocked ? 'Blocked' : 'Allowed'} · risk {aiResult.risk}% · {aiResult.reason}</p>}</div>}
      {tab === 'team' && <div className="space-y-3"><div className="flex gap-2"><input value={teamName} onChange={(event) => setTeamName(event.target.value)} className="flex-1 bg-slate-700 rounded px-3 py-2 text-white" placeholder="Team name" /><button onClick={createTeam} className="px-4 py-2 rounded bg-indigo-600 text-white">Create team</button></div>{teams.map((team) => <div key={team.name} className="flex justify-between text-sm text-slate-300"><span>{team.name}</span><span>{team.score} XP</span></div>)}</div>}
      {tab === 'logs' && <pre className="max-h-40 overflow-auto bg-slate-950 rounded p-3 text-xs text-green-300">{logs.length ? logs.join('\n') : 'No logs yet. Start a simulation to stream activity.'}</pre>}
      {tab === 'profile' && <div className="space-y-3"><div className="grid grid-cols-3 gap-3 text-center"><div><strong className="block text-2xl text-white">0</strong><span className="text-xs text-slate-400">Saved XP</span></div><div><strong className="block text-2xl text-white">{score.totalRequests}</strong><span className="text-xs text-slate-400">Requests this run</span></div><div><strong className="block text-2xl text-white"><Lightbulb className="inline text-yellow-300" size={20} /> Hints</strong><span className="text-xs text-slate-400">Contextual remediation</span></div></div><button onClick={requestHint} className="px-4 py-2 rounded bg-yellow-600 text-white text-sm">I need a hint</button>{hint && <p className="text-sm text-yellow-200">{hint}</p>}</div>}
    </section>
  );
}