'use client';

import { useState } from 'react';
import { Rule, RuleCondition } from '../types';
import { Plus, Trash2 } from 'lucide-react';

interface RuleBuilderProps {
  rules: Rule[];
  onRulesChange: (rules: Rule[]) => void;
  disabled?: boolean;
}

export default function RuleBuilder({ rules, onRulesChange, disabled = false }: RuleBuilderProps) {
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const addRule = () => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      name: 'New Rule',
      description: 'Add a description',
      conditions: [
        {
          field: 'uri',
          condition: 'contains',
          value: '',
        },
      ],
      action: 'block',
      enabled: true,
    };
    onRulesChange([...rules, newRule]);
    setExpandedRule(newRule.id);
  };

  const updateRule = (ruleId: string, updates: Partial<Rule>) => {
    onRulesChange(
      rules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates } : rule))
    );
  };

  const deleteRule = (ruleId: string) => {
    onRulesChange(rules.filter((rule) => rule.id !== ruleId));
    if (expandedRule === ruleId) {
      setExpandedRule(null);
    }
  };

  const addCondition = (ruleId: string) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      updateRule(ruleId, {
        conditions: [
          ...rule.conditions,
          {
            field: 'uri',
            condition: 'contains',
            value: '',
          },
        ],
      });
    }
  };

  const updateCondition = (ruleId: string, conditionIndex: number, updates: Partial<RuleCondition>) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      const newConditions = [...rule.conditions];
      newConditions[conditionIndex] = { ...newConditions[conditionIndex], ...updates };
      updateRule(ruleId, { conditions: newConditions });
    }
  };

  const deleteCondition = (ruleId: string, conditionIndex: number) => {
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      updateRule(ruleId, {
        conditions: rule.conditions.filter((_, i) => i !== conditionIndex),
      });
    }
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">WAF Rules</h2>
        <button
          onClick={addRule}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={16} />
          Add Rule
        </button>
      </div>

      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No rules configured. Add a rule to start defending against attacks.
          </div>
        ) : (
          rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-slate-700/50 rounded-lg border border-slate-600 overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-700 transition-colors"
                onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(e) => {
                      e.stopPropagation();
                      updateRule(rule.id, { enabled: e.target.checked });
                    }}
                    disabled={disabled}
                    className="w-4 h-4 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-blue-500"
                  />
                  <div>
                    <h3 className="font-medium text-white">{rule.name}</h3>
                    <p className="text-sm text-slate-400">{rule.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rule.action === 'block' ? 'bg-red-500/20 text-red-400' :
                    rule.action === 'challenge' ? 'bg-orange-500/20 text-orange-400' :
                    rule.action === 'rateLimit' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {rule.action}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRule(rule.id);
                    }}
                    disabled={disabled}
                    className="p-1 text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {expandedRule === rule.id && (
                <div className="p-4 border-t border-slate-600 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Rule Name</label>
                      <input
                        type="text"
                        value={rule.name}
                        onChange={(e) => updateRule(rule.id, { name: e.target.value })}
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Action</label>
                      <select
                        value={rule.action}
                        onChange={(e) => updateRule(rule.id, { action: e.target.value as any })}
                        disabled={disabled}
                        className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      >
                        <option value="block">Block</option>
                        <option value="challenge">Challenge</option>
                        <option value="rateLimit">Rate Limit</option>
                        <option value="allow">Allow</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                    <input
                      type="text"
                      value={rule.description}
                      onChange={(e) => updateRule(rule.id, { description: e.target.value })}
                      disabled={disabled}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm text-slate-400">Conditions (AND logic)</label>
                      <button
                        onClick={() => addCondition(rule.id)}
                        disabled={disabled}
                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={14} />
                        Add Condition
                      </button>
                    </div>
                    <div className="space-y-2">
                      {rule.conditions.map((condition, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <select
                            value={condition.field}
                            onChange={(e) => updateCondition(rule.id, index, { field: e.target.value as any })}
                            disabled={disabled}
                            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="header">Header</option>
                            <option value="uri">URI</option>
                            <option value="query">Query</option>
                            <option value="body">Body</option>
                            <option value="ip">IP</option>
                            <option value="userAgent">User Agent</option>
                            <option value="method">Method</option>
                          </select>
                          <select
                            value={condition.condition}
                            onChange={(e) => updateCondition(rule.id, index, { condition: e.target.value as any })}
                            disabled={disabled}
                            className="px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="contains">Contains</option>
                            <option value="equals">Equals</option>
                            <option value="regex">Regex</option>
                            <option value="startsWith">Starts With</option>
                            <option value="endsWith">Ends With</option>
                          </select>
                          <input
                            type="text"
                            value={condition.value}
                            onChange={(e) => updateCondition(rule.id, index, { value: e.target.value })}
                            disabled={disabled}
                            placeholder="Value"
                            className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          />
                          <button
                            onClick={() => deleteCondition(rule.id, index)}
                            disabled={disabled}
                            className="p-2 text-slate-400 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
