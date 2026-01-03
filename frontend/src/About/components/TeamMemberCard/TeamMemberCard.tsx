import React from 'react';
import styles from './TeamMemberCard.module.css';

interface TeamMemberCardProps {
  name: string;
  role: string;
  initials: string;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ name, role, initials }) => {
  return (
    <div className={styles.card}>
      <div className={styles.avatar}>{initials}</div>
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.role}>{role}</p>
    </div>
  );
};
