export const calculateProfileCompletion = (user, volunteer) => {
  const checks = [
    user?.name,
    user?.email,
    user?.phone,
    user?.location,
    user?.bio,
    user?.interests?.length,
    volunteer?.skills?.length,
    volunteer?.availability,
    user?.avatarUrl
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

