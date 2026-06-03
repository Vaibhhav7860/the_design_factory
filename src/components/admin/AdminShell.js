"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineHome,
  HiOutlineInbox,
  HiOutlineTag,
  HiOutlineUser,
  HiOutlineSpeakerphone,
  HiOutlineGift,
  HiOutlinePhotograph,
  HiOutlineGlobe,
  HiOutlineChartBar,
  HiOutlineCog,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineSparkles,
  HiOutlineViewGrid,
} from "react-icons/hi";
import GlobalSearch from "./GlobalSearch";
import styles from "./AdminShell.module.css";

const NAV_ITEMS = [
  { href: "/admin", icon: HiOutlineHome, label: "Home", exact: true },
  { href: "/admin/orders", icon: HiOutlineInbox, label: "Orders", badge: "orders" },
  { href: "/admin/products", icon: HiOutlineTag, label: "Products" },
  { href: "/admin/categories", icon: HiOutlineViewGrid, label: "Categories" },
  { href: "/admin/customers", icon: HiOutlineUser, label: "Customers" },
  { href: "/admin/marketing", icon: HiOutlineSpeakerphone, label: "Marketing" },
  { href: "/admin/discounts", icon: HiOutlineGift, label: "Discounts" },
  { href: "/admin/content", icon: HiOutlinePhotograph, label: "Content" },
  { href: "/admin/markets", icon: HiOutlineGlobe, label: "Markets" },
  { href: "/admin/analytics", icon: HiOutlineChartBar, label: "Analytics" },
];

export default function AdminShell({ user, children, badges }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className={styles.shell}>
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
        aria-label="Admin navigation"
      >
        <div className={styles.brand}>
          <div className={styles.brandMark}>
            <HiOutlineSparkles aria-hidden="true" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>The Design Factory</span>
            <span className={styles.brandLabel}>Admin</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV_ITEMS.map(({ href, icon: Icon, label, exact, badge }) => {
            const active = isActive(href, exact);
            const badgeValue = badge ? badges?.[badge] : null;
            return (
              <Link
                key={href}
                href={href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className={styles.navIcon} aria-hidden="true" />
                <span className={styles.navLabel}>{label}</span>
                {badgeValue ? (
                  <span className={styles.navBadge}>{badgeValue}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <Link
            href="/admin/settings"
            className={`${styles.navItem} ${isActive("/admin/settings") ? styles.navItemActive : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <HiOutlineCog className={styles.navIcon} aria-hidden="true" />
            <span className={styles.navLabel}>Settings</span>
          </Link>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>

          <GlobalSearch />

          <div className={styles.topActions}>
            <button className={styles.iconBtn} aria-label="Notifications">
              <HiOutlineBell />
            </button>
            <UserMenu user={user} />
          </div>
        </header>

        <div className={styles.content}>{children}</div>
      </div>

      {mobileOpen ? (
        <button
          className={styles.scrim}
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}
    </div>
  );
}

function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const initials = (user?.name || user?.email || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={styles.userMenu}>
      <button
        className={styles.userAvatar}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open ? (
        <div className={styles.userPopover} role="menu">
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.name || "Admin"}</span>
            <span className={styles.userEmail}>{user?.email}</span>
            <span className={styles.userRole}>{user?.role}</span>
          </div>
          <div className={styles.userDivider} />
          <Link href="/admin/account" className={styles.userMenuItem} onClick={() => setOpen(false)}>
            Account &amp; security
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className={styles.userMenuItem}>
              <HiOutlineLogout /> Log out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
