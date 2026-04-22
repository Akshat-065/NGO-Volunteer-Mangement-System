import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  Users
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { classNames } from "../../utils/formatters";
import { getRoleLabel, isPrivilegedRole } from "../../utils/roles";

const Sidebar = ({ open, onToggle }) => {
  const { user, logout } = useAuth();

  const navigation = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    isPrivilegedRole(user?.role) ? { label: "Volunteers", to: "/volunteers", icon: Users } : null,
    { label: "Events", to: "/events", icon: CalendarDays },
    { label: "Applications", to: "/applications", icon: ClipboardCheck },
    { label: "Profile", to: "/profile", icon: UserRound }
  ].filter(Boolean);

  return (
    <>
      <button
        type="button"
        className="fixed left-4 top-4 z-50 rounded-2xl bg-white/90 p-3 text-ink shadow-card lg:hidden"
        onClick={onToggle}
      >
        <Menu size={20} />
      </button>

      <div
        className={classNames(
          "fixed inset-0 z-40 bg-ink/45 backdrop-blur-sm transition lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onToggle}
      />

      <aside
        className={classNames(
          "fixed left-0 top-0 z-50 flex h-screen w-[290px] flex-col border-r border-white/50 bg-[#fbfdfe]/95 px-5 py-6 shadow-ambient backdrop-blur-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="rounded-[28px] bg-ink px-5 py-6 text-white shadow-lg shadow-ink/20">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">NGO Connect</p>
          <h1 className="mt-3 font-display text-3xl leading-tight">
            Volunteer
            <br />
            Command Center
          </h1>
          <p className="mt-3 text-sm text-white/70">
            Coordinate volunteers, events, approvals, and impact from one place.
          </p>
        </div>

        <nav className="mt-8 flex-1 space-y-2">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => open && onToggle()}
              className={({ isActive }) =>
                classNames(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                  isActive
                    ? "bg-tide/10 text-lagoon"
                    : "text-slate hover:bg-white hover:text-ink"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="surface-soft p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate/70">
            {getRoleLabel(user?.role)}
          </p>
          <h2 className="mt-2 text-lg font-bold text-ink">{user?.name}</h2>
          <p className="mt-1 text-sm text-slate">{user?.email}</p>
          <button
            type="button"
            onClick={logout}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-coral transition hover:text-[#f56a46]"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
