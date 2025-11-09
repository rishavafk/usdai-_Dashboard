import Plot from 'react-plotly.js';
import { motion } from 'framer-motion';
import { SchoolData } from '../types/data';

interface ScatterPlotProps {
  data: SchoolData[];
}

export const ScatterPlot = ({ data }: ScatterPlotProps) => {
  const sampleData = data.filter((_, idx) => idx % 3 === 0).slice(0, 500);

  const trace = {
    x: sampleData.map(d => d.PTR_2425),
    y: sampleData.map(d => d.total_boys_func_toilet + d.total_girls_func_toilet),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: 8,
      color: sampleData.map(d => d.boys_enrollment_change_rate),
      colorscale: [
        [0, '#ef4444'],
        [0.5, '#fbbf24'],
        [1, '#10b981']
      ],
      showscale: true,
      colorbar: {
        title: 'Boys Enrollment<br>Change Rate (%)',
        thickness: 15,
        len: 0.7,
      },
      line: {
        color: 'white',
        width: 1
      }
    },
    text: sampleData.map(d => `${d.state}<br>${d.district}<br>PTR: ${d.PTR_2425.toFixed(1)}<br>Toilets: ${(d.total_boys_func_toilet + d.total_girls_func_toilet).toFixed(0)}`),
    hovertemplate: '%{text}<extra></extra>',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-yellow-400"
    >
      <h3 className="text-lg font-black text-gray-900 mb-4 uppercase tracking-wide">
        PTR vs Functional Toilets
      </h3>
      <Plot
        data={[trace]}
        layout={{
          autosize: true,
          xaxis: {
            title: 'Pupil-Teacher Ratio (PTR)',
            gridcolor: '#e5e7eb',
            titlefont: { size: 12, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 11, color: '#6b7280' },
          },
          yaxis: {
            title: 'Total Functional Toilets',
            gridcolor: '#e5e7eb',
            titlefont: { size: 12, color: '#4b5563', family: 'Arial Black' },
            tickfont: { size: 11, color: '#6b7280' },
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
