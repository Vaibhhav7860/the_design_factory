import styles from "./Card.module.css";

export function Card({ children, padded = true, className = "" }) {
  return (
    <div className={`${styles.card} ${padded ? styles.padded : ""} ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, actions }) {
  return (
    <div className={styles.cardHeader}>
      <div>
        <h3 className={styles.cardTitle}>{title}</h3>
        {subtitle ? <p className={styles.cardSubtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.cardActions}>{actions}</div> : null}
    </div>
  );
}

export function CardSection({ children }) {
  return <div className={styles.cardSection}>{children}</div>;
}

export function StatTile({ label, value, change, tone = "neutral" }) {
  return (
    <div className={styles.statTile}>
      <span className={styles.statLabel}>{label}</span>
      <span className={styles.statValue}>{value}</span>
      {change !== undefined && change !== null ? (
        <span className={`${styles.statChange} ${styles[`tone-${tone}`]}`}>{change}</span>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className={styles.empty}>
      {icon ? <div className={styles.emptyIcon}>{icon}</div> : null}
      <h3 className={styles.emptyTitle}>{title}</h3>
      {description ? <p className={styles.emptyDescription}>{description}</p> : null}
      {action ? <div className={styles.emptyAction}>{action}</div> : null}
    </div>
  );
}
