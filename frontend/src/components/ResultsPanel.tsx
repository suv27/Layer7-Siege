'use client';

import { SimulationScore } from '../types';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface ResultsPanelProps {
  score: SimulationScore;
  isComplete?: boolean;
}

export default function ResultsPanel({ score, isComplete = false }: ResultsPanelProps) {
  const totalAttacks = score.attacksBlocked + score.attacksMissed;
  const totalBenign = score.benignAllowed + score.benignBlocked;
  
  const blockRate = totalAttacks > 0 ? (score.attacksBlocked / totalAttacks) * 100 : 0;
  const falsePositiveRate = totalBenign > 0 ? (score.benignBlocked / totalBenign) * 100 : 0;

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-400';
    if (accuracy >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPassFail = () => {
    if (!isComplete) return null;
    if (score.accuracy >= 80 && falsePositiveRate <= 10) {
      return (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle size={20} />
          <span className="font-semibold">PASSED</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2 text-red-400">
        <XCircle size={20} />
        <span className="font-semibold">FAILED</span>
      </div>
    );
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Results</h2>
        {getPassFail()}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white mb-1">{score.totalRequests}</div>
          <div className="text-sm text-slate-400">Total Requests</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-green-400 mb-1">{score.attacksBlocked}</div>
          <div className="text-sm text-slate-400">Attacks Blocked</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">{score.attacksMissed}</div>
          <div className="text-sm text-slate-400">Attacks Missed</div>
        </div>
        <div className="bg-slate-700/50 rounded-lg p-4 text-center">
          <div className={`text-3xl font-bold ${getAccuracyColor(score.accuracy)} mb-1`}>
            {score.accuracy.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400">Accuracy</div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Attack Block Rate</span>
            <span className="text-sm font-medium text-white">{blockRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${blockRate}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">False Positive Rate</span>
            <span className="text-sm font-medium text-white">{falsePositiveRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${falsePositiveRate}%` }}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Benign Traffic Allowed</span>
            <span className="text-green-400 font-medium">{score.benignAllowed}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-slate-400">Benign Traffic Blocked (False Positives)</span>
            <span className="text-red-400 font-medium">{score.benignBlocked}</span>
          </div>
        </div>

        {isComplete && (
          <div className="pt-4 border-t border-slate-700 bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-blue-400 mt-0.5" size={20} />
              <div>
                <h3 className="font-medium text-white mb-1">Performance Summary</h3>
                <p className="text-sm text-slate-400">
                  {score.accuracy >= 80 && falsePositiveRate <= 10
                    ? 'Excellent! Your WAF rules effectively blocked attacks while minimizing false positives.'
                    : 'Your rules need improvement. Try to increase attack blocking while reducing false positives.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
