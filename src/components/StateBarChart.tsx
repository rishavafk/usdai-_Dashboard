import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { StateAggregate } from '../types/data';

interface StateBarChartProps {
  data: StateAggregate[];
}

export const StateBarChart = ({ data }: StateBarChartProps) => {
  const topStates = data.slice(0, 15);

  const trace1 = {
    x: topStates.map(d => d.state),
    y: topStates.map(d => d.avgPTR),
    name: 'Average PTR',
    type: 'bar',
    marker: {
      color: '#fbbf24',
    },
    yaxis: 'y',
  };

  const trace2 = {
    x: topStates.map(d => d.state),
    y: topStates.map(d => d.avgChangeRate),
    name: 'Avg Enrollment Change Rate',
    type: 'bar',
    marker: {
      color: '#059669',
    },
    yaxis: 'y2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-emerald-600"
    >
      <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wide">
        State-wise Analysis (Top 15)
      </h3>
      <Plot
        data={[trace1, trace2]}
        layout={{
          autosize: true,
          xaxis: {
            title: 'State',
            tickangle: -45,
            titlefont: { size: 12, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 10, color: '#6b7280' },
          },
          yaxis: {
            title: 'Average PTR',
            titlefont: { size: 12, color: '#fbbf24', family: 'Arial Black' },
            tickfont: { color: '#fbbf24', size: 10 },
          },
          yaxis2: {
            title: 'Avg Change Rate (%)',
            titlefont: { size: 12, color: '#059669', family: 'Arial Black' },
            tickfont: { color: '#059669', size: 10 },
            overlaying: 'y',
            side: 'right',
          },
          legend: {
            x: 0.5,
            y: 1.15,
            xanchor: 'center',
            orientation: 'h',
            font: { size: 11 }
          },
          plot_bgcolor: '#f9fafb',
          paper_bgcolor: 'white',
          margin: { l: 70, r: 70, t: 40, b: 120 },
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
        style={{ width: '100%', height: '450px' }}
      />
    </motion.div>
  );
};
