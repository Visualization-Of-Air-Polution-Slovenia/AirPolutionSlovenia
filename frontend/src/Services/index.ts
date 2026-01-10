/**
 * Services barrel export
 */

// API functions (for direct use or in custom queries)
export { getCityData, ping } from './api';
export type { CityDataResponse, PingResponse } from './api';

// React Query hooks (recommended for components)
export { queryKeys, useCityData, usePing } from './queries';
