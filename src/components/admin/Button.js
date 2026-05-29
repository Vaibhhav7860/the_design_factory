import Link from "next/link";
import styles from "./Button.module.css";

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  type = "button",
  disabled,
  onClick,
  iconLeft,
  iconRight,
  ...rest
}) {
  const cls = `${styles.btn} ${styles[`variant-${variant}`]} ${styles[`size-${size}`]}`;
  const content = (
    <>
      {iconLeft ? <span className={styles.icon}>{iconLeft}</span> : null}
      <span>{children}</span>
      {iconRight ? <span className={styles.icon}>{iconRight}</span> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cls} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} onClick={onClick} {...rest}>
      {content}
    </button>
  );
}

export function ButtonGroup({ children }) {
  return <div className={styles.group}>{children}</div>;
}
