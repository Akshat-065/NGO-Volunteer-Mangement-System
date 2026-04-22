import { getInitials } from "../../utils/formatters";

const UserAvatar = ({ name, avatarUrl, size = "md" }) => {
  const sizes = {
    sm: "h-10 w-10 text-xs",
    md: "h-12 w-12 text-sm",
    lg: "h-20 w-20 text-xl"
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizes[size]} rounded-2xl object-cover shadow-card`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} flex items-center justify-center rounded-2xl bg-ink font-bold text-white shadow-card`}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;

