import { teamMembers } from './About.content';
import styles from './About.module.css';
import { TeamMemberCard } from './components/TeamMemberCard/TeamMemberCard';

export const About = () => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <section id="about" className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>About Us</h2>
        <p className={styles.subtitle}>
          We are a team of students dedicated to visualizing air pollution data in Slovenia 
          to raise awareness and provide accessible information.
        </p>
      </div>
      
      <div className={styles.grid}>
        {teamMembers.map((member) => (
          <div key={member.name} className={styles.gridItem}>
            <TeamMemberCard 
              name={member.name}
              role={member.role}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              initials={(member as any).customInitials || getInitials(member.name)}
            />
          </div>
        ))}
      </div>

      <div className={styles.contactSection}>
        <p>
          This visualization project was created as a group assignment for the <strong>Interaction and Information Design</strong> course.
        </p>
        <p>
          For inquiries, please contact the project leader: <br />
          <strong>Luka Rizman</strong> — <a href="mailto:lr37199@student.uni-lj.si" className={styles.contactLink}>lr37199@student.uni-lj.si</a>
        </p>
      </div>
    </section>
  );
};
