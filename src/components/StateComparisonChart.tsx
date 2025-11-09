import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { StateAggregate } from '../types/data';

interface StateComparisonChartProps {
  data: StateAggregate[];
}

export const StateComparisonChart = ({ data }: StateComparisonChartProps) => {
  const topStates = data
    .sort((a, b) => b.avgFacilityScore - a.avgFacilityScore)
    .slice(0, 15);

  const trace = {
    x: topStates.map(d => d.avgFacilityScore),
    y: topStates.map(d => d.avgRetention),
    mode: 'markers+text',
    type: 'scatter',
    marker: {
      size: 16,
      color: topStates.map(d => d.avgRetention),
      colorscale: [
        [0, '#ef4444'],
        [0.5, '#fbbf24'],
        [1, '#059669']
      ],
      showscale: true,
      colorbar: {
        title: 'Retention<br>Rate (%)',
        thickness: 15,
        len: 0.6,
        titlefont: { size: 11 },
      },
      line: {
        color: 'white',
        width: 2
      }
    },
    text: topStates.map(d => d.state.substring(0, 3).toUpperCase()),
    textposition: 'middle center',
    textfont: {
      size: 10,
      color: 'white',
      family: 'Arial Black',
    },
    hovertemplate: topStates.map(d =>
      `<b>${d.state}</b><br>` +
      `Facility Score: ${d.avgFacilityScore.toFixed(2)}<br>` +
      `Retention Rate: ${d.avgRetention.toFixed(2)}%<extra></extra>`
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-emerald-600"
    >
      <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wide">
        State-level Facility vs Retention (Top 15)
      </h3>
      <Plot
        data={[trace]}
        layout={{
          autosize: true,
          xaxis: {
            title: 'Average Facility Score',
            gridcolor: '#e5e7eb',
            titlefont: { size: 12, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 10, color: '#6b7280' },
          },
          yaxis: {
            title: 'Average Retention Rate (%)',
            gridcolor: '#e5e7eb',
            titlefont: { size: 12, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 10, color: '#6b7280' },
          },
          hovermode: 'closest',
          plot_bgcolor: '#f9fafb',
          paper_bgcolor: 'white',
          margin: { l: 70, r: 60, t: 40, b: 70 },
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
        style={{ width: '100%', height: '450px' }}
      />
    </motion.div>
  );
};
