import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { Outlet } from "react-router-dom";

const features = [
  {
    title: "Volunteer-first workflows",
    description: "Track applications, event assignments, and profile readiness in one calm workspace.",
    icon: HeartHandshake
  },
  {
    title: "Admin visibility",
    description: "Keep an eye on active events, pending approvals, and team momentum without spreadsheets.",
    icon: ShieldCheck
  },
  {
    title: "Modern coordination",
    description: "A polished experience designed for growing NGOs that need structure without losing warmth.",
    icon: Sparkles
  }
];

const AuthLayout = () => (
  <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
    <section className="relative hidden overflow-hidden bg-ink px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(47,163,160,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,122,89,0.22),transparent_38%)]" />
      <div className="relative">
        <p className="text-sm uppercase tracking-[0.32em] text-white/70">NGO Volunteer Management</p>
        <h1 className="mt-6 max-w-xl font-display text-6xl leading-[1.04]">
          Organize people,
          <br />
          events, and impact
          <br />
          with confidence.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
          A structured platform for community teams who need clear visibility, quick approvals, and responsive volunteer operations.
        </p>
      </div>

      <div className="relative grid gap-4">
        {features.map(({ title, description, icon: Icon }) => (
          <div key={title} className="rounded-[28px] border border-white/15 bg-white/8 p-5 backdrop-blur-sm">
            <div className="inline-flex rounded-2xl bg-white/10 p-3 text-white">
              <Icon size={20} />
            </div>
            <h2 className="mt-4 text-xl font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-7 text-white/72">{description}</p>
          </div>
        ))}
      </div>
    </section>

    <section className="flex items-center justify-center px-4 py-10 md:px-8 lg:px-12">
      <div className="w-full max-w-xl animate-rise">
        <Outlet />
      </div>
    </section>
  </div>
);

export default AuthLayout;

