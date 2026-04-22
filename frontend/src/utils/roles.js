export const hasRequiredRole = (currentRole, allowedRoles = []) => {
  if (!currentRole) {
    return false;
  }

  if (allowedRoles.includes(currentRole)) {
    return true;
  }

  return currentRole === "super_admin" && allowedRoles.some((role) => role !== "volunteer");
};

export const isPrivilegedRole = (role) => role === "admin" || role === "super_admin";

export const getRoleLabel = (role) => {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "admin":
      return "Administrator";
    default:
      return "Volunteer";
  }
};
