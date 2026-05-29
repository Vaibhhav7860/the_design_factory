import AdminShell from "@/components/admin/AdminShell";
import { auth } from "@/lib/auth/config";
import "./admin.css";

export const metadata = {
  title: "Admin · The Design Factory",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }) {
  const session = await auth();

  // Login page renders a bare layout
  return (
    <div className="adminRoot">
      {session?.user ? (
        <AdminShell user={session.user}>{children}</AdminShell>
      ) : (
        children
      )}
    </div>
  );
}
