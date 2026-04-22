import { classNames } from "../../utils/formatters";

const styles = {
  primary:
    "bg-ink text-white hover:bg-lagoon focus:ring-ink/20 shadow-lg shadow-ink/10",
  secondary:
    "bg-sand text-ink hover:bg-[#efe1d0] focus:ring-coral/20 border border-[#ead8c3]",
  ghost: "bg-white text-ink hover:bg-cloud focus:ring-mist border border-mist/70",
  danger:
    "bg-coral text-white hover:bg-[#f56a46] focus:ring-coral/20 shadow-lg shadow-coral/20"
};

const Button = ({
  children,
  variant = "primary",
  type = "button",
  className = "",
  isLoading = false,
  disabled = false,
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || isLoading}
    className={classNames(
      "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60",
      styles[variant],
      className
    )}
    {...props}
  >
    {isLoading ? "Please wait..." : children}
  </button>
);

export default Button;

