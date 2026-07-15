export type DashboardUserSource = {
  firstName: string;
  lastName: string;
  email: string;
};

export type DashboardUser = {
  name: string;
  email: string;
  initial: string;
};

export function formatDashboardUser(user: DashboardUserSource): DashboardUser {
  const name = user.firstName.trim();
  const initial = (name || user.email).trim().charAt(0).toUpperCase();

  return {
    name,
    email: user.email,
    initial,
  };
}
