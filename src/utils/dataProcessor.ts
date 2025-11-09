import { SchoolData, ProcessedData, StateAggregate, CorrelationData } from '../types/data';

export const processData = (rawData: unknown[]): ProcessedData => {
  const cleanData: SchoolData[] = rawData
    .map((row: any) => ({
      state: row.state || '',
      district: row.district || '',
      PTR_2425: parseFloat(row.PTR_2425) || 0,
      total_boys_func_toilet: parseFloat(row.total_boys_func_toilet) || 0,
      total_girls_func_toilet: parseFloat(row.total_girls_func_toilet) || 0,
      boys_enrollment_change_rate: parseFloat(row.boys_enrollment_change_rate) || 0,
      girls_enrollment_change_rate: parseFloat(row.girls_enrollment_change_rate) || 0,
      total_tch: parseFloat(row.total_tch) || 1,
    }))
    .filter(d => d.PTR_2425 > 0 && d.total_tch > 0);

  cleanData.forEach(d => {
    d.retention_rate = (d.boys_enrollment_change_rate + d.girls_enrollment_change_rate) / 2;
  });

  const stats = calculateStats(cleanData);
  const stateAggregates = calculateStateAggregates(cleanData);
  const correlationMatrix = calculateCorrelations(cleanData);

  return {
    raw: cleanData,
    stats,
    stateAggregates,
    correlationMatrix,
  };
};

const calculateStats = (data: SchoolData[]) => {
  const validToilets = data.filter(d =>
    (d.total_boys_func_toilet + d.total_girls_func_toilet) > 0
  ).length;

  return {
    avgPTR: data.reduce((sum, d) => sum + d.PTR_2425, 0) / data.length,
    toiletCoverage: (validToilets / data.length) * 100,
    avgBoysChangeRate: data.reduce((sum, d) => sum + d.boys_enrollment_change_rate, 0) / data.length,
    avgGirlsChangeRate: data.reduce((sum, d) => sum + d.girls_enrollment_change_rate, 0) / data.length,
  };
};

const calculateStateAggregates = (data: SchoolData[]): StateAggregate[] => {
  const stateMap = new Map<string, SchoolData[]>();

  data.forEach(row => {
    if (!stateMap.has(row.state)) {
      stateMap.set(row.state, []);
    }
    stateMap.get(row.state)!.push(row);
  });

  const aggregates: StateAggregate[] = [];

  stateMap.forEach((schools, state) => {
    const avgPTR = schools.reduce((sum, s) => sum + s.PTR_2425, 0) / schools.length;
    const avgChangeRate = schools.reduce((sum, s) =>
      sum + (s.boys_enrollment_change_rate + s.girls_enrollment_change_rate) / 2, 0
    ) / schools.length;

    const avgFacilityScore = schools.reduce((sum, s) =>
      sum + ((s.total_boys_func_toilet + s.total_girls_func_toilet) / s.total_tch), 0
    ) / schools.length;

    const avgRetention = avgChangeRate;

    aggregates.push({
      state,
      avgPTR,
      avgChangeRate,
      avgFacilityScore,
      avgRetention,
    });
  });

  return aggregates.sort((a, b) => b.avgChangeRate - a.avgChangeRate);
};

export const calculateCorrelations = (data: SchoolData[]): CorrelationData => {
  const variables = [
    'PTR',
    'Total Toilets',
    'Boys Change Rate',
    'Girls Change Rate',
    'Retention Rate'
  ];

  const getColumn = (idx: number): number[] => {
    switch(idx) {
      case 0: return data.map(d => d.PTR_2425);
      case 1: return data.map(d => d.total_boys_func_toilet + d.total_girls_func_toilet);
      case 2: return data.map(d => d.boys_enrollment_change_rate);
      case 3: return data.map(d => d.girls_enrollment_change_rate);
      case 4: return data.map(d => d.retention_rate || 0);
      default: return [];
    }
  };

  const correlations: number[][] = [];

  for (let i = 0; i < variables.length; i++) {
    correlations[i] = [];
    const col1 = getColumn(i);

    for (let j = 0; j < variables.length; j++) {
      const col2 = getColumn(j);
      correlations[i][j] = pearsonCorrelation(col1, col2);
    }
  }

  return { variables, correlations };
};

export const pearsonCorrelation = (x: number[], y: number[]): number => {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
};
