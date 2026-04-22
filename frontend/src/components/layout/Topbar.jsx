import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";
import { getRoleLabel } from "../../utils/roles";
import InstallAppPrompt from "../ui/InstallAppPrompt";

const titles = {
  "/dashboard": "Dashboard",
  "/volunteers": "Volunteer Management",
  "/events": "Event Management",
  "/applications": "Applications",
  "/profile": "My Profile"
};

const Topbar = () => {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.28em] text-slate/70">Impact Operations</p>
        <h1 className="mt-2 font-display text-4xl text-ink">{titles[location.pathname] || "Workspace"}</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-card">
          <Search size={16} className="text-slate" />
          <span className="text-sm text-slate">Stay aligned with live volunteer activity</span>
        </div>
        <InstallAppPrompt className="self-start sm:self-auto" />
        <button type="button" className="rounded-2xl bg-white/85 p-3 text-slate shadow-card">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 rounded-2xl bg-white/85 px-4 py-3 shadow-card">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink text-sm font-bold text-white">
            {getInitials(user?.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">{user?.name}</p>
            <p className="text-xs text-slate">{getRoleLabel(user?.role)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
