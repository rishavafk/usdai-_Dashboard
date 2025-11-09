import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { CorrelationData } from '../types/data';

interface CorrelationHeatmapProps {
  data: CorrelationData;
}

export const CorrelationHeatmap = ({ data }: CorrelationHeatmapProps) => {
  const trace = {
    z: data.correlations,
    x: data.variables,
    y: data.variables,
    type: 'heatmap',
    colorscale: [
      [0, '#ef4444'],
      [0.5, '#fbbf24'],
      [1, '#10b981']
    ],
    text: data.correlations.map(row =>
      row.map(val => val.toFixed(2))
    ),
    hovertemplate: '%{y} vs %{x}<br>Correlation: %{z:.3f}<extra></extra>',
    showscale: true,
    colorbar: {
      title: 'Correlation',
      thickness: 15,
      len: 0.7,
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-yellow-400"
    >
      <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wide">
        Correlation Matrix
      </h3>
      <Plot
        data={[trace]}
        layout={{
          autosize: true,
          xaxis: {
            tickangle: -45,
            side: 'bottom',
            titlefont: { size: 11, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 10, color: '#6b7280' },
          },
          yaxis: {
            autorange: 'reversed',
            titlefont: { size: 11, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 10, color: '#6b7280' },
          },
          annotations: data.correlations.flatMap((row, i) =>
            row.map((val, j) => ({
              x: data.variables[j],
              y: data.variables[i],
              text: val.toFixed(2),
              showarrow: false,
              font: {
                color: Math.abs(val) > 0.5 ? 'white' : 'black',
                size: 11,
                family: 'Arial Black',
              },
            }))
          ),
          plot_bgcolor: '#f9fafb',
          paper_bgcolor: 'white',
          margin: { l: 120, r: 40, t: 40, b: 120 },
        }}
        config={{ responsive: true, displayModeBar: false }}
        className="w-full"
        style={{ width: '100%', height: '450px' }}
      />
    </motion.div>
  );
};
