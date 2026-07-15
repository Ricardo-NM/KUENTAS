import { z } from "zod";

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

export const profileNameSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresa tu nombre."),
  lastName: z.string().trim().min(1, "Ingresa tus apellidos."),
});

export type ProfileNameInput = z.infer<typeof profileNameSchema>;

export function formatDashboardUser(user: DashboardUserSource): DashboardUser {
  const name = user.firstName.trim();
  const initial = (name || user.email).trim().charAt(0).toUpperCase();

  return {
    name,
    email: user.email,
    initial,
  };
}
