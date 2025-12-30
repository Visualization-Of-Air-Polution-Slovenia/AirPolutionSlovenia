import { teamMembers } from './About.content';
import styles from './About.module.css';

export const About = () => {
  return (
    <section id="about" className={styles.about}>
      <div className={styles.container}>

        <h2>About Us</h2>
        <p className={styles.description}> We are a team of students dedicated to visualizing air pollution data in Slovenia to raise awareness and provide accessible information.  </p>
        
        <div className={styles.grid}>
          {teamMembers.map((member) => (
            <div key={member.name} className={styles.card}>
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};
