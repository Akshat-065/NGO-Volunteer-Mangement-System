const LoadingSpinner = ({ label = "Loading..." }) => (
  <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-slate">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-mist border-t-tide" />
    <p className="text-sm font-medium">{label}</p>
  </div>
);

export default LoadingSpinner;

