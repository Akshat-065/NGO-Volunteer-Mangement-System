import { classNames } from "../../utils/formatters";

const Card = ({ children, className = "" }) => (
  <div className={classNames("surface-card", className)}>{children}</div>
);

export default Card;

