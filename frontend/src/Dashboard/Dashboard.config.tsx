export const POLLUTION_TYPES = ['pm10', 'pm2.5', 'no2', 'o3'] as const;

export const renderPollutionButtons = (
  currentType: typeof POLLUTION_TYPES[number],
  setType: (type: typeof POLLUTION_TYPES[number]) => void
) => {
  return POLLUTION_TYPES.map((type) => (
    <button
      key={type}
      className={`btn ${currentType === type ? 'btn-primary' : 'btn-outline'}`}
      onClick={() => setType(type)}
    >
      {type.toUpperCase()}
    </button>
  ));
};
