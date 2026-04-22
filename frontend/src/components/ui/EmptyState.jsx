const EmptyState = ({ title, description }) => (
  <div className="surface-soft flex min-h-[220px] flex-col items-center justify-center px-6 py-10 text-center">
    <h3 className="font-display text-2xl text-ink">{title}</h3>
    <p className="mt-3 max-w-md subtle-text">{description}</p>
  </div>
);

export default EmptyState;

