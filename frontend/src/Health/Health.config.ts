/**
 * Helper function to determine style based on tone.
 * @param tone - The tone of the card (danger, warning, info, etc.)
 * @returns CSS properties object for background and color
 */
export const getToneStyle = (tone: string) => {
  if (tone === 'danger') return { background: 'color-mix(in srgb, var(--danger) 18%, transparent)', color: 'var(--danger)' };
  if (tone === 'warning') return { background: 'color-mix(in srgb, var(--warning) 18%, transparent)', color: 'var(--warning)' };
  if (tone === 'info') return { background: 'color-mix(in srgb, var(--secondary) 18%, transparent)', color: 'var(--secondary)' };
  return { background: 'color-mix(in srgb, var(--surface-2) 60%, transparent)', color: 'var(--text)' };
};

/**
 * Helper function to determine border color based on type.
 * @param border - The border type (danger, warning, primary, etc.)
 * @returns CSS variable string for the color
 */
export const getBorderColor = (border: string) => {
  if (border === 'danger') return 'var(--danger)';
  if (border === 'warning') return 'var(--warning)';
  if (border === 'primary') return 'var(--primary)';
  return 'color-mix(in srgb, var(--text) 45%, transparent)';
};
