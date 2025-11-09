import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { motion } from 'framer-motion';
import { GraduationCap, X, ChevronDown } from 'lucide-react';
import { ProcessedData } from './types/data';
import { processData, calculateCorrelations } from './utils/dataProcessor';
import { LoadingSpinner } from './components/LoadingSpinner';
import { KPICard } from './components/KPICard';
import { ScatterPlot } from './components/ScatterPlot';
import { StateBarChart } from './components/StateBarChart';
import { CorrelationHeatmap } from './components/CorrelationHeatmap';
import { FacilityScoreChart } from './components/FacilityScoreChart';
import { StateComparisonChart } from './components/StateComparisonChart';

function App() {
  const [data, setData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/master_final_reduced.csv');
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: false,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const processed = processData(results.data);
              setData(processed);
              setLoading(false);
            } catch (err) {
              setError('Error processing data');
              setLoading(false);
            }
          },
          error: (err: Error) => {
            setError(`Error parsing CSV: ${err.message}`);
            setLoading(false);
          },
        });
      } catch (err) {
        setError('Error loading CSV file');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h2>
          <p className="text-gray-700">{error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  // Extract unique states and districts
  const uniqueStates = Array.from(new Set(data.raw.map(d => d.state).filter(s => s))).sort();
  const availableDistricts = selectedState === 'All States'
    ? Array.from(new Set(data.raw.map(d => d.district).filter(d => d))).sort()
    : Array.from(new Set(data.raw.filter(d => d.state === selectedState).map(d => d.district).filter(d => d))).sort();

  // Filter data based on selections
  const filteredRawData = data.raw.filter(d => {
    const stateMatch = selectedState === 'All States' || d.state === selectedState;
    const districtMatch = selectedDistrict === 'All Districts' || d.district === selectedDistrict;
    return stateMatch && districtMatch;
  });

  // Recalculate stats and aggregates for filtered data
  const filteredData: ProcessedData = {
    raw: filteredRawData,
    stats: {
      avgPTR: filteredRawData.length > 0
        ? filteredRawData.reduce((sum, d) => sum + d.PTR_2425, 0) / filteredRawData.length
        : 0,
      toiletCoverage: filteredRawData.length > 0
        ? (filteredRawData.filter(d => (d.total_boys_func_toilet + d.total_girls_func_toilet) > 0).length / filteredRawData.length) * 100
        : 0,
      avgBoysChangeRate: filteredRawData.length > 0
        ? filteredRawData.reduce((sum, d) => sum + d.boys_enrollment_change_rate, 0) / filteredRawData.length
        : 0,
      avgGirlsChangeRate: filteredRawData.length > 0
        ? filteredRawData.reduce((sum, d) => sum + d.girls_enrollment_change_rate, 0) / filteredRawData.length
        : 0,
    },
    stateAggregates: (() => {
      const stateMap = new Map<string, typeof filteredRawData>();
      filteredRawData.forEach(row => {
        if (!stateMap.has(row.state)) {
          stateMap.set(row.state, []);
        }
        stateMap.get(row.state)!.push(row);
      });

      const aggregates = Array.from(stateMap.entries()).map(([state, schools]) => {
        const avgPTR = schools.reduce((sum, s) => sum + s.PTR_2425, 0) / schools.length;
        const avgChangeRate = schools.reduce((sum, s) =>
          sum + (s.boys_enrollment_change_rate + s.girls_enrollment_change_rate) / 2, 0
        ) / schools.length;
        const avgFacilityScore = schools.reduce((sum, s) =>
          sum + ((s.total_boys_func_toilet + s.total_girls_func_toilet) / s.total_tch), 0
        ) / schools.length;

        return {
          state,
          avgPTR,
          avgChangeRate,
          avgFacilityScore,
          avgRetention: avgChangeRate,
        };
      });

      return aggregates.sort((a, b) => b.avgChangeRate - a.avgChangeRate);
    })(),
    correlationMatrix: calculateCorrelations(filteredRawData), // Recalculate for filtered data
  };

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('All Districts'); // Reset district when state changes
  };

  const handleResetFilters = () => {
    setSelectedState('All States');
    setSelectedDistrict('All Districts');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`${sidebarOpen ? 'w-72' : 'w-0'} bg-yellow-400 p-6 overflow-y-auto transition-all duration-300 shadow-xl`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 text-gray-800 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-8 mt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">UDISE+</h1>
              <p className="text-xs font-bold text-gray-700">Education Analytics</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-300 rounded-lg p-4 border-2 border-gray-800">
            <label className="text-sm font-bold text-gray-800 block mb-2">STATE</label>
            <div className="relative">
              <select
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full bg-white border-2 border-gray-800 rounded px-3 py-2 text-gray-800 font-bold appearance-none cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <option value="All States">All States</option>
                {uniqueStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-800 pointer-events-none" />
            </div>
          </div>

          <div className="bg-yellow-300 rounded-lg p-4 border-2 border-gray-800">
            <label className="text-sm font-bold text-gray-800 block mb-2">DISTRICT</label>
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={availableDistricts.length === 0}
                className="w-full bg-white border-2 border-gray-800 rounded px-3 py-2 text-gray-800 font-bold appearance-none cursor-pointer hover:bg-gray-50 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                <option value="All Districts">All Districts</option>
                {availableDistricts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-800 pointer-events-none" />
            </div>
          </div>

          <div className="bg-yellow-300 rounded-lg p-4 border-2 border-gray-800">
            <label className="text-sm font-bold text-gray-800 block mb-2">SCHOOL TYPE</label>
            <div className="relative">
              <select className="w-full bg-white border-2 border-gray-800 rounded px-3 py-2 text-gray-800 font-bold appearance-none">
                <option>All Types</option>
              </select>
              <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-800" />
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            className="w-full bg-white border-2 border-gray-800 text-gray-900 font-black py-3 rounded-full hover:bg-gray-100 transition-colors"
          >
            RESET FILTERS
          </button>
        </div>
      </motion.aside>

      <div className="flex-1">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed left-4 top-4 bg-yellow-400 p-3 rounded-lg z-50 hover:bg-yellow-300 transition-colors shadow-lg"
          >
            <ChevronDown className="w-6 h-6 text-gray-800 rotate-90" />
          </button>
        )}

        <main className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="AVERAGE PTR"
              value={filteredData.stats.avgPTR.toFixed(1)}
              icon={GraduationCap}
              color="border-emerald-600"
              delay={0}
            />
            <KPICard
              title="TOILET COVERAGE"
              value={`${filteredData.stats.toiletCoverage.toFixed(1)}%`}
              icon={GraduationCap}
              color="border-yellow-500"
              delay={0.1}
            />
            <KPICard
              title="AVG BOYS RETENTION"
              value={`${filteredData.stats.avgBoysChangeRate.toFixed(2)}%`}
              icon={GraduationCap}
              color="border-pink-500"
              delay={0.2}
            />
            <KPICard
              title="AVG GIRLS RETENTION"
              value={`${filteredData.stats.avgGirlsChangeRate.toFixed(2)}%`}
              icon={GraduationCap}
              color="border-emerald-600"
              delay={0.3}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <ScatterPlot data={filteredData.raw} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-600"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">SCHOOL DISTRIBUTION</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Total Schools:</span>
                  <span className="text-2xl font-black text-yellow-600">{filteredData.raw.length.toLocaleString()}</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Avg Enrollment:</span>
                  <span className="text-xl font-bold text-gray-800">High</span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">Coverage:</span>
                  <span className="text-xl font-bold text-emerald-600">Excellent</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <StateBarChart data={filteredData.stateAggregates} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <CorrelationHeatmap data={filteredData.correlationMatrix} />
            <FacilityScoreChart data={filteredData.raw} />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <StateComparisonChart data={filteredData.stateAggregates} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
