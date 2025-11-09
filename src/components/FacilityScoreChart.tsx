import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { SchoolData } from '../types/data';

interface FacilityScoreChartProps {
  data: SchoolData[];
}

export const FacilityScoreChart = ({ data }: FacilityScoreChartProps) => {
  const processedData = data
    .map(d => ({
      facilityScore: (d.total_boys_func_toilet + d.total_girls_func_toilet) / d.total_tch,
      retentionRate: d.retention_rate || 0,
      state: d.state,
    }))
    .filter(d => d.facilityScore > 0 && d.facilityScore < 50)
    .filter((_, idx) => idx % 5 === 0)
    .slice(0, 500);

  const trace = {
    x: processedData.map(d => d.facilityScore),
    y: processedData.map(d => d.retentionRate),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 7,
      color: '#ec4899',
      opacity: 0.7,
      line: {
        color: 'white',
        width: 1
      }
    },
    text: processedData.map(d => `State: ${d.state}<br>Score: ${d.facilityScore.toFixed(2)}<br>Retention: ${d.retentionRate.toFixed(2)}%`),
    hovertemplate: '%{text}<extra></extra>',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-pink-500"
    >
      <h3 className="text-lg font-black text-gray-900 mb-2 uppercase tracking-wide">
        Facility Score vs Retention
      </h3>
      <p className="text-xs font-bold text-gray-600 mb-4">
        Score = Toilets ÷ Teachers
      </p>
      <Plot
        data={[trace]}
        layout={{
          autosize: true,
          xaxis: {
            title: 'Facility Score',
            gridcolor: '#e5e7eb',
            titlefont: { size: 12, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 10, color: '#6b7280' },
          },
          yaxis: {
            title: 'Retention Rate (%)',
            gridcolor: '#e5e7eb',
            titlefont: { size: 12, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 10, color: '#6b7280' },
          },
          hovermode: 'closest',
          plot_bgcolor: '#f9fafb',
          paper_bgcolor: 'white',
          margin: { l: 70, r: 40, t: 40, b: 70 },
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
        style={{ width: '100%', height: '400px' }}
      />
    </motion.div>
  );
};
