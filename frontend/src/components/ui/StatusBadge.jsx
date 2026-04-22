import { classNames } from "../../utils/formatters";

const styles = {
  Upcoming: "bg-tide/10 text-lagoon border border-tide/20",
  Completed: "bg-slate/10 text-slate border border-slate/20",
  Pending: "bg-[#fff4dd] text-[#a66b00] border border-[#f2d18a]",
  Approved: "bg-[#e8f7ef] text-[#137c45] border border-[#b9e5ca]",
  Rejected: "bg-[#feeceb] text-[#c33d2d] border border-[#f6c0b9]"
};

const StatusBadge = ({ status }) => (
  <span
    className={classNames(
      "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
      styles[status] || "bg-cloud text-slate border border-mist"
    )}
  >
    {status}
  </span>
);

export default StatusBadge;

