'use client';

import { useState, useEffect } from 'react';
import { EvaluationResult } from '../types';

interface TrafficVisualizerProps {
  isSimulationRunning: boolean;
}

export default function TrafficVisualizer({ isSimulationRunning }: TrafficVisualizerProps) {
  const [traffic, setTraffic] = useState<EvaluationResult[]>([]);
  const [eventSource, setEventSource] = useState<EventSource | null>(null);

  useEffect(() => {
    if (isSimulationRunning && !eventSource) {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const source = new EventSource(`${API_URL}/api/simulation/stream`);

      source.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') {
            console.log('SSE connected');
          } else if (data.data) {
            setTraffic((prev) => {
              const newTraffic = [data.data, ...prev];
              // Keep only last 50 events
              return newTraffic.slice(0, 50);
            });
          }
        } catch (error) {
          console.error('Error parsing SSE data:', error);
        }
      };

      source.onerror = (error) => {
        console.error('SSE error:', error);
        source.close();
      };

      setEventSource(source);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
        setEventSource(null);
      }
    };
  }, [isSimulationRunning, eventSource]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'allowed':
        return 'bg-green-500';
      case 'blocked':
        return 'bg-red-500';
      case 'rateLimited':
        return 'bg-yellow-500';
      case 'challenged':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'allowed':
        return 'Allowed';
      case 'blocked':
        return 'Blocked';
      case 'rateLimited':
        return 'Rate Limited';
      case 'challenged':
        return 'Challenged';
      default:
        return status;
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Live Traffic Stream</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
          <span className="text-sm text-slate-400">
            {isSimulationRunning ? 'Live' : 'Stopped'}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-700">
              <th className="pb-3 pr-4">Status</th>
              <th className="pb-3 pr-4">Request ID</th>
              <th className="pb-3 pr-4">Attack</th>
              <th className="pb-3 pr-4">Rule</th>
              <th className="pb-3 pr-4">Score</th>
              <th className="pb-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {traffic.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  {isSimulationRunning ? 'Waiting for traffic...' : 'Start simulation to see traffic'}
                </td>
              </tr>
            ) : (
              traffic.map((event) => (
                <tr key={event.requestId} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(event.status)}`} />
                      <span className="text-white">{getStatusText(event.status)}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-300 font-mono text-xs">
                    {event.requestId}
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.isAttack ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {event.isAttack ? 'Attack' : 'Benign'}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-slate-300">
                    {event.matchedRule ? event.matchedRule.name : '-'}
                  </td>
                  <td className={`py-3 pr-4 font-medium ${
                    event.score > 0 ? 'text-green-400' : event.score < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {event.score > 0 ? '+' : ''}{event.score}
                  </td>
                  <td className="py-3 text-slate-400 text-xs">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {traffic.length > 0 && (
        <div className="mt-4 text-xs text-slate-500">
          Showing last {traffic.length} events
        </div>
      )}
    </div>
  );
}
