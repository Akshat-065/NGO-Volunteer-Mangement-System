export const ROLES = Object.freeze({
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  VOLUNTEER: "volunteer"
});

export const ADMIN_ROLES = [ROLES.ADMIN, ROLES.SUPER_ADMIN];

export const hasRequiredRole = (currentRole, allowedRoles = []) => {
  if (!currentRole) {
    return false;
  }

  if (allowedRoles.includes(currentRole)) {
    return true;
  }

  return (
    currentRole === ROLES.SUPER_ADMIN &&
    allowedRoles.some((role) => role !== ROLES.VOLUNTEER)
  );
};

export const isPrivilegedRole = (role) => ADMIN_ROLES.includes(role);

export const getRoleLabel = (role) => {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return "Super Admin";
    case ROLES.ADMIN:
      return "Administrator";
    default:
      return "Volunteer";
  }
};
