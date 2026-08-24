import styles from "./styles/SourceCard.module.css";

interface Props {
  title: string;
  subtitle: string;
}

export default function SourceCard({
  title,
  subtitle,
}: Props) {
  return (
    <div className={styles.sourceCard}>
      <div className={styles.sourceCardTitle}>{title}</div>
      <div className={styles.sourceCardSubtitle}>{subtitle}</div>
    </div>
  );
}