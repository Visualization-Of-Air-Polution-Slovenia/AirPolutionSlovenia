type TimeRangeKey = '7D' | '30D' | '1Y' | '10Y';

type SubtitleParams = {
  timeRange: TimeRangeKey;
  rangeMode: 'preset' | 'custom';
  customDays: number;
  compareCities: boolean;
  startDate: string;
  endDate: string;
};


const getTimeRangeLabel = (
  timeRange: TimeRangeKey,
  rangeMode: 'preset' | 'custom',
  customDays: number,
  startDate: string,
  endDate: string
): string => {
  if (rangeMode === 'custom') {
    if (customDays <= 7) return `${customDays}-Day View`;
    if (customDays <= 31) return `${customDays}-Day View`;
    if (customDays <= 90) return `${customDays}-Day View`;
    if (customDays <= 365) return `${customDays}-Day View`;
    return `${customDays}-Day View`;
  }

  switch (timeRange) {
    case '7D':
      return 'Weekly View';
    case '30D':
      return 'Monthly View';
    case '1Y':
      return 'Yearly View';
    case '10Y':
      return 'Decade View';
    default:
      return 'Custom View';
  }
};

/**
 * Generates the analysis type label based on comparison mode.
 */
const getAnalysisTypeLabel = (compareCities: boolean): string => {
  return compareCities ? 'City comparison' : 'Trend analysis';
};

/**
 * Generates a dynamic subtitle for the trends widget based on current filter settings.
 * 
 * @example
 * // Returns: "Trend analysis (Weekly View)"
 * generateTrendsSubtitle({ timeRange: '7D', rangeMode: 'preset', ... })
 * 
 * @example
 * // Returns: "City comparison (Monthly View)"
 * generateTrendsSubtitle({ timeRange: '30D', compareCities: true, ... })
 * vrne compare city
 * 
 * @example
 * // Returns: "Trend analysis (14-Day View)"
 * generateTrendsSubtitle({ rangeMode: 'custom', customDays: 14, ... })
 * vrne za 14 dni anazlio
 */
export const generateTrendsSubtitle = ({
  timeRange,
  rangeMode,
  customDays,
  compareCities,
  startDate,
  endDate,
}: SubtitleParams): string => {
  const analysisType = getAnalysisTypeLabel(compareCities);
  const timeRangeLabel = getTimeRangeLabel(timeRange, rangeMode, customDays, startDate, endDate);

  return `${analysisType} (${timeRangeLabel})`;
};
