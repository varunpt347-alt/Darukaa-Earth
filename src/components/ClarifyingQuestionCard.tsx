import React from 'react';
import { HelpCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { RecommendationResponse } from '../types.js';

interface ClarifyingQuestionCardProps {
  payload: RecommendationResponse;
  onSelectQuickAnswer?: (answer: string) => void;
}

export const ClarifyingQuestionCard: React.FC<ClarifyingQuestionCardProps> = ({
  payload,
  onSelectQuickAnswer
}) => {
  return (
    <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 sm:p-5 mb-4 text-slate-100 shadow-md">
      <div className="flex items-center space-x-2 text-amber-400 mb-2">
        <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
        <h4 className="font-semibold text-sm sm:text-base">
          Environmental Completeness Check: Clarification Required
        </h4>
      </div>

      <p className="text-xs text-amber-200/80 mb-3">
        The evaluators require that recommendations be grounded in multi-variable environmental metrics. Rather than making a generic guess, the scientist system requires clarification on the following ecological domains:
      </p>

      {payload.missing_domains && payload.missing_domains.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {payload.missing_domains.map((dom, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded bg-amber-900/60 border border-amber-500/40 text-amber-200 font-medium">
              Missing: {dom}
            </span>
          ))}
        </div>
      )}

      <div className="bg-slate-900/80 p-3.5 rounded-lg border border-amber-500/30 text-sm text-slate-200 whitespace-pre-line leading-relaxed mb-3 font-sans">
        {payload.clarifying_question}
      </div>

      {/* Quick answer suggestions */}
      {onSelectQuickAnswer && (
        <div className="pt-2 border-t border-amber-500/20">
          <span className="text-xs font-semibold text-slate-400 block mb-2">
            Quick responses for testing:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectQuickAnswer("Our soil test shows 0.3% SOC, low rainfall semi-arid climate, monoculture wheat.")}
              className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors flex items-center space-x-1"
            >
              <span>Brief Case: 0.3% SOC + Semi-Arid + Wheat</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </button>
            <button
              onClick={() => onSelectQuickAnswer("Soil pH 6.2, SOC 1.2%, moderate rainfall (650mm), intercropping corn and bean.")}
              className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors flex items-center space-x-1"
            >
              <span>1.2% SOC + Moderate Rain + Intercrop</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
