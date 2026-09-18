import React, { useState } from 'react';
import { Search, Database, GitFork, Compass, BookOpen, AlertCircle } from 'lucide-react';
import { KnowledgeChunk, MatchedThreshold, InferredClimate } from '../types.js';

export const DebugRetrievalPane: React.FC = () => {
  const [query, setQuery] = useState('monoculture wheat soil organic carbon semi-arid low rainfall');
  const [soc, setSoc] = useState('0.3');
  const [landUse, setLandUse] = useState('monoculture_wheat');
  const [lat, setLat] = useState('31.5');
  const [lon, setLon] = useState('74.3');

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    query: string;
    inferred_climate?: InferredClimate | null;
    matched_thresholds: MatchedThreshold[];
    retrieved_knowledge_chunks: KnowledgeChunk[];
    causal_variables_activated: string[];
  } | null>(null);

  const handleInspect = async () => {
    setIsLoading(true);
    try {
      const payload = {
        query,
        top_k: 4,
        structured_metrics: {
          soil_organic_carbon_pct: parseFloat(soc) || undefined,
          land_use: landUse,
          lat: parseFloat(lat) || undefined,
          lon: parseFloat(lon) || undefined
        }
      };

      const res = await fetch('/debug/retrieve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Debug retrieve error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-100">
      <div className="mb-6 pb-4 border-b border-slate-800">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <span>Knowledge Layer & Causal Graph Inspector (Phase 2 & 4 Debug View)</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Directly query the hybrid retrieval engine and view scored vector chunks, threshold alerts, and causal activation nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Search Query String
          </label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. monoculture wheat semi-arid soil organic carbon"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Soil Carbon (SOC %)
          </label>
          <input
            type="number"
            step="0.05"
            value={soc}
            onChange={(e) => setSoc(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-emerald-400 font-mono focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Land Use
          </label>
          <select
            value={landUse}
            onChange={(e) => setLandUse(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
          >
            <option value="monoculture_wheat">Monoculture Wheat</option>
            <option value="agroforestry">Agroforestry</option>
            <option value="silvopasture">Silvopasture</option>
            <option value="intercropping_cereal_legume">Intercropping</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Latitude
          </label>
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
            Longitude
          </label>
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono focus:outline-none"
          />
        </div>
      </div>

      <button
        onClick={handleInspect}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all mb-6"
      >
        <Search className="w-4 h-4" />
        <span>{isLoading ? 'Executing Hybrid Retrieval...' : 'Inspect Knowledge Layer Pipeline (/debug/retrieve)'}</span>
      </button>

      {/* Results View */}
      {results && (
        <div className="space-y-6 pt-4 border-t border-slate-800">
          {/* Inferred Climate if available */}
          {results.inferred_climate && (
            <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                <Compass className="w-4 h-4" />
                <span>Geo-Spatial Climate Inference</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Coordinates:</span>
                  <p className="font-mono text-slate-200">{results.inferred_climate.latitude}°, {results.inferred_climate.longitude}°</p>
                </div>
                <div>
                  <span className="text-slate-400">Inferred Zone:</span>
                  <p className="font-bold text-emerald-300">{results.inferred_climate.inferred_climate_zone}</p>
                </div>
                <div>
                  <span className="text-slate-400">Estimated Rainfall:</span>
                  <p className="font-mono text-slate-200">{results.inferred_climate.estimated_annual_rainfall}</p>
                </div>
              </div>
            </div>
          )}

          {/* Causal Graph Variables Activated */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <GitFork className="w-4 h-4" />
              <span>Multi-Metric Causal Variables Activated ({results.causal_variables_activated?.length || 0})</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {results.causal_variables_activated?.map((v, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded bg-indigo-950 border border-indigo-500/40 text-indigo-300 font-mono">
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Matched Thresholds */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>Quantitative Empirical Threshold Matches ({results.matched_thresholds?.length || 0})</span>
            </h3>
            <div className="space-y-2">
              {results.matched_thresholds?.map((m, i) => (
                <div key={i} className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-amber-300 font-mono">{m.variable}: {m.value}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{m.scientific_source}</span>
                  </div>
                  <p className="text-slate-300">{m.status || m.hazard || m.classification}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Scored Vector Chunks */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Top-k Retrieved Vector Chunks (TF-IDF Cosine Similarity)</span>
            </h3>
            <div className="space-y-3">
              {results.retrieved_knowledge_chunks?.map((chunk, i) => (
                <div key={i} className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-700 text-xs">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-emerald-300 text-xs">{chunk.source}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono text-[11px]">
                      Score: {chunk.retrieval_score}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{chunk.content}</p>
                  {chunk.keywords && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {chunk.keywords.map((kw, ki) => (
                        <span key={ki} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
