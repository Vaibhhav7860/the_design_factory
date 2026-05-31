"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiOutlineLocationMarker,
  HiOutlineLockClosed,
  HiOutlineMail,
} from "react-icons/hi";
import styles from "@/app/(storefront)/account/dashboard.module.css";

const LINKS = [
  { href: "/account", label: "Overview", icon: HiOutlineUser, exact: true },
  { href: "/account/orders", label: "Orders", icon: HiOutlineShoppingBag },
  { href: "/account#addresses", label: "Addresses", icon: HiOutlineLocationMarker, hash: "addresses" },
  { href: "/account#preferences", label: "Preferences", icon: HiOutlineMail, hash: "preferences" },
  { href: "/account#security", label: "Security", icon: HiOutlineLockClosed, hash: "security" },
];

export default function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.side} aria-label="Account">
      {LINKS.map(({ href, label, icon: Icon, exact, hash }) => {
        let active;
        if (hash) {
          active = false; // hashes are for in-page navigation only
        } else if (exact) {
          active = pathname === href;
        } else {
          active = pathname === href || pathname.startsWith(href + "/");
        }
        return (
          <Link
            key={href}
            href={href}
            className={`${styles.sideLink} ${active ? styles.sideLinkActive : ""}`}
          >
            <Icon />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
