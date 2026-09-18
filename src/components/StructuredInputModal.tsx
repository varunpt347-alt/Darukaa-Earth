import React, { useState } from 'react';
import { Send, Code, Sliders, MapPin, Sparkles } from 'lucide-react';
import { EnvironmentalInput } from '../types.js';

interface StructuredInputProps {
  onSubmit: (data: EnvironmentalInput) => void;
  isLoading: boolean;
}

export const StructuredInputView: React.FC<StructuredInputProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<'form' | 'json'>('form');

  const [formData, setFormData] = useState<EnvironmentalInput>({
    soil_organic_carbon_pct: 0.3,
    rainfall: 'low',
    land_use: 'monoculture_wheat',
    region_climate: 'semi-arid',
    soil_ph: 6.8,
    pesticide_intensity_kg_ha: 0.5,
    lat: 31.5,
    lon: 74.3
  });

  const [jsonText, setJsonText] = useState<string>(
    JSON.stringify(
      {
        soil_organic_carbon_pct: 0.3,
        rainfall: "low",
        land_use: "monoculture_wheat",
        region_climate: "semi-arid",
        lat: 31.5,
        lon: 74.3
      },
      null,
      2
    )
  );

  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleJsonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText);
      setJsonError(null);
      onSubmit(parsed);
    } catch (err: any) {
      setJsonError('Invalid JSON format: ' + err.message);
    }
  };

  const loadPreset = (presetName: string) => {
    let preset: EnvironmentalInput;
    if (presetName === 'brief_benchmark') {
      preset = {
        soil_organic_carbon_pct: 0.3,
        rainfall: 'low',
        land_use: 'monoculture_wheat',
        region_climate: 'semi-arid'
      };
    } else if (presetName === 'pesticide_runoff') {
      preset = {
        soil_organic_carbon_pct: 0.8,
        rainfall: 'moderate',
        land_use: 'cropland',
        region_climate: 'sub-humid',
        pesticide_intensity_kg_ha: 4.2
      };
    } else if (presetName === 'agroforestry_refinement') {
      preset = {
        soil_organic_carbon_pct: 0.3,
        rainfall: 'low',
        land_use: 'agroforestry',
        region_climate: 'semi-arid'
      };
    } else {
      preset = {
        soil_organic_carbon_pct: 1.8,
        rainfall: 'high',
        land_use: 'silvopasture',
        region_climate: 'humid'
      };
    }

    setFormData(preset);
    setJsonText(JSON.stringify(preset, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
            <Code className="w-5 h-5 text-emerald-400" />
            <span>Structured Environmental Input (Phase 5)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Submit validated JSON or configure individual agroecological indicators.
          </p>
        </div>

        {/* Mode switcher */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setMode('form')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1 transition-all ${
              mode === 'form' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Visual Form</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('json')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center space-x-1 transition-all ${
              mode === 'json' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-6 bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Evaluation Scenarios:</span>
        </span>
        <button
          type="button"
          onClick={() => loadPreset('brief_benchmark')}
          className="text-xs px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-emerald-300 border border-emerald-500/30 transition-colors"
        >
          Brief Case: SOC 0.3% + Semi-Arid + Monoculture Wheat
        </button>
        <button
          type="button"
          onClick={() => loadPreset('pesticide_runoff')}
          className="text-xs px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-sky-300 border border-sky-500/30 transition-colors"
        >
          Scenario 2: High Chemical Runoff (4.2 kg/ha)
        </button>
        <button
          type="button"
          onClick={() => loadPreset('agroforestry_refinement')}
          className="text-xs px-2.5 py-1 rounded bg-slate-700 hover:bg-slate-600 text-amber-300 border border-amber-500/30 transition-colors"
        >
          Scenario 3: Agroforestry Refinement
        </button>
      </div>

      {mode === 'form' ? (
        <form onSubmit={handleFormSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Soil Organic Carbon % */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Soil Organic Carbon (SOC %)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="10"
                  value={formData.soil_organic_carbon_pct ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, soil_organic_carbon_pct: parseFloat(e.target.value) || 0 })
                  }
                  className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
                <span className="text-xs text-slate-400">
                  {formData.soil_organic_carbon_pct !== undefined && formData.soil_organic_carbon_pct < 0.6
                    ? '⚠️ Critical low degradation (<0.6%)'
                    : 'Sub-optimal to Moderate'}
                </span>
              </div>
            </div>

            {/* Land Use / Crop */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Land Use / Crop System
              </label>
              <select
                value={formData.land_use || ''}
                onChange={(e) => setFormData({ ...formData, land_use: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="monoculture_wheat">Monoculture Wheat (Cereal continuous)</option>
                <option value="monoculture_maize">Monoculture Maize / Corn</option>
                <option value="intercropping_cereal_legume">Intercropping (Cereal + Legume)</option>
                <option value="agroforestry">Agroforestry (Alley Cropping)</option>
                <option value="silvopasture">Silvopasture (Trees + Pasture)</option>
                <option value="cropland">General Cropland</option>
              </select>
            </div>

            {/* Rainfall Pattern */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Rainfall & Hydrological Regime
              </label>
              <select
                value={formData.rainfall || ''}
                onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="low">Low Rainfall (Arid / Semi-Arid &lt;500mm)</option>
                <option value="moderate">Moderate Rainfall (Sub-Humid 500-1000mm)</option>
                <option value="high">High Rainfall (Humid &gt;1000mm)</option>
              </select>
            </div>

            {/* Region Climate */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Regional Climate Zone
              </label>
              <input
                type="text"
                value={formData.region_climate || ''}
                onChange={(e) => setFormData({ ...formData, region_climate: e.target.value })}
                placeholder="e.g. semi-arid, Mediterranean, tropical"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Soil pH */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Soil pH
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.soil_ph ?? ''}
                onChange={(e) => setFormData({ ...formData, soil_ph: parseFloat(e.target.value) || 7.0 })}
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Pesticide Intensity */}
            <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Pesticide Application (kg a.i./ha)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.pesticide_intensity_kg_ha ?? ''}
                onChange={(e) =>
                  setFormData({ ...formData, pesticide_intensity_kg_ha: parseFloat(e.target.value) || 0 })
                }
                className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Bonus: Geo-Coordinates */}
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-700/60">
            <div className="flex items-center space-x-1.5 mb-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Bonus: Spatial Geo-Coordinates (Lat / Lon)
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Latitude:</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lat ?? ''}
                  onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Longitude:</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.lon ?? ''}
                  onChange={(e) => setFormData({ ...formData, lon: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Infers regional Köppen-Geiger climate classification and estimated annual rainfall regimes automatically.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Processing Environmental Analysis...' : 'Submit Form to Scientist Engine'}</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleJsonSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              JSON Payload (Pydantic / TypeScript EnvironmentalInput Schema)
            </label>
            <textarea
              rows={12}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-emerald-400 font-mono text-xs sm:text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>

          {jsonError && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-lg text-rose-300 text-xs font-mono">
              {jsonError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center space-x-2 shadow-lg transition-all"
          >
            <Send className="w-4 h-4" />
            <span>{isLoading ? 'Processing JSON Analysis...' : 'Submit JSON to Scientist Engine'}</span>
          </button>
        </form>
      )}
    </div>
  );
};
