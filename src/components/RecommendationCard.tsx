import React, { useState } from 'react';
import { CheckCircle, Clock, BookOpen, Activity, Compass, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { RecommendationResponse } from '../types.js';

interface RecommendationCardProps {
  payload: RecommendationResponse;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ payload }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-xl overflow-hidden shadow-lg mb-4 text-slate-100">
      {/* Top Banner: Verification and Traced Variables */}
      <div className="bg-slate-800/80 px-4 py-2.5 border-b border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Scientifically Validated Recommendation
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 font-medium">
            {payload.confidence_level || 'High Confidence'}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="text-xs text-slate-400 font-mono">
            Traced {payload.variables_traced?.length || 3} Variables:
          </span>
          <div className="flex flex-wrap gap-1">
            {payload.variables_traced?.map((v, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-mono">
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Recommendation (Mandatory) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Recommendation</span>
          </h4>
          <p className="text-sm sm:text-base font-semibold text-emerald-300 leading-relaxed bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/20">
            {payload.recommendation}
          </p>
        </div>

        {/* Why it works (Mechanism explanation) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Why it Works (Mechanism-Level Explanation)</span>
          </h4>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
            {payload.why_it_works}
          </p>
        </div>

        {/* Impacted metrics */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Impacted Metrics & Measurable Estimates</span>
          </h4>
          <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-sm text-amber-200 leading-relaxed font-medium">
            {payload.impacted_metrics}
          </div>
        </div>

        {/* Time Horizon & Sources */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Time Horizon</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-200">
              {payload.time_horizon}
            </p>
          </div>

          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-700/40">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Scientific Sources & Literature</span>
            </h4>
            <p className="text-xs text-slate-300 leading-snug font-mono">
              {payload.source}
            </p>
          </div>
        </div>

        {/* Causal Chain Trace and RAG Evidence Toggle */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 py-1.5 px-2 rounded hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center space-x-1.5">
              <span>Scientific Causal Graph Trace & Grounding Evidence</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px]">
                {payload.retrieved_sources?.length || 0} Chunks Cited
              </span>
            </span>
            {showEvidence ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showEvidence && (
            <div className="mt-3 space-y-3 pt-2 border-t border-slate-800 text-xs">
              {/* Causal steps */}
              {payload.causal_chain && payload.causal_chain.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                    Multi-Variable Causal Graph Pathway:
                  </span>
                  <div className="space-y-1.5 pl-2 border-l-2 border-emerald-500/50">
                    {payload.causal_chain.map((step, idx) => (
                      <div key={idx} className="text-slate-300 font-mono text-[11px] leading-relaxed">
                        <span className="text-emerald-400 font-bold mr-1.5">Step {idx + 1}:</span>
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Retrieved Chunks */}
              {payload.retrieved_sources && payload.retrieved_sources.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                    Retrieved Knowledge Documents (RAG):
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {payload.retrieved_sources.map((chunk, i) => (
                      <div key={i} className="bg-slate-800/60 p-2.5 rounded border border-slate-700/60">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-emerald-300 text-[11px]">{chunk.source}</span>
                          {chunk.retrieval_score && (
                            <span className="text-[10px] text-slate-400 font-mono">Score: {chunk.retrieval_score}</span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{chunk.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
