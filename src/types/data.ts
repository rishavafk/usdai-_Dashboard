export interface SchoolData {
  state: string;
  district: string;
  PTR_2425: number;
  total_boys_func_toilet: number;
  total_girls_func_toilet: number;
  boys_enrollment_change_rate: number;
  girls_enrollment_change_rate: number;
  total_tch: number;
  retention_rate?: number;
}

export interface ProcessedData {
  raw: SchoolData[];
  stats: {
    avgPTR: number;
    toiletCoverage: number;
    avgBoysChangeRate: number;
    avgGirlsChangeRate: number;
  };
  stateAggregates: StateAggregate[];
  correlationMatrix: CorrelationData;
}

export interface StateAggregate {
  state: string;
  avgPTR: number;
  avgChangeRate: number;
  avgFacilityScore: number;
  avgRetention: number;
}

export interface CorrelationData {
  variables: string[];
  correlations: number[][];
}
