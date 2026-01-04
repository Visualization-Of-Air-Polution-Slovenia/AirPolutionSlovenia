import styles from './MapEmbed.module.css';

import type { HTMLAttributeReferrerPolicy } from 'react';

export type MapEmbedProps = {
  src: string;
  title: string;
  ariaLabel: string;
  loading: 'eager' | 'lazy';
  referrerPolicy: HTMLAttributeReferrerPolicy;
  allowFullScreen: boolean;
};

export const MapEmbed = ({ src, title, ariaLabel, loading, referrerPolicy, allowFullScreen }: MapEmbedProps) => {
  return (
    <div className={styles.frame} aria-label={ariaLabel}>
      <iframe
        className={styles.iframe}
        title={title}
        src={src}
        loading={loading}
        referrerPolicy={referrerPolicy}
        allowFullScreen={allowFullScreen}
      />
    </div>
  );
};
