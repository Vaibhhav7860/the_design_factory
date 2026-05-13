import styles from "./Button.module.css";
import { cn } from "@/lib/utils";

export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  return (
    <button
      className={cn(styles.btn, styles[variant], styles[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
