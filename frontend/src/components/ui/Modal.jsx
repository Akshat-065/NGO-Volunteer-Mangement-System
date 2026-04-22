import { X } from "lucide-react";
import { classNames } from "../../utils/formatters";

const Modal = ({ open, title, children, onClose, className = "" }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4 py-8 backdrop-blur-sm">
      <div className={classNames("surface-card w-full max-w-3xl p-6 md:p-8", className)}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-cloud p-2 text-slate transition hover:bg-mist"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

