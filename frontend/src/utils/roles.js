export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'];

export const isAdmin = (user) =>
  user && ADMIN_ROLES.includes(user.role);

export const canEdit = (user) => isAdmin(user);

export const isReadOnlyUser = (user) =>
  user && user.role === 'USER';
