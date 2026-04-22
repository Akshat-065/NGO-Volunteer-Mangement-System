import Card from "./Card";

const StatCard = ({ icon: Icon, label, value, helper, accentClass = "bg-tide/10 text-lagoon" }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate/80">{label}</p>
        <p className="mt-3 text-3xl font-extrabold text-ink">{value}</p>
        <p className="mt-2 text-sm text-slate">{helper}</p>
      </div>
      <div className={`rounded-2xl p-3 ${accentClass}`}>
        <Icon size={20} />
      </div>
    </div>
  </Card>
);

export default StatCard;

