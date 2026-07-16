import { z } from "zod";

export type DashboardUserSource = {
  firstName: string;
  lastName: string;
  email: string;
  profileImagePath?: string | null;
};

export type DashboardUser = {
  name: string;
  email: string;
  initial: string;
  profileImagePath: string | null;
};

export const profileNameSchema = z.object({
  firstName: z.string().trim().min(1, "Ingresa tu nombre."),
  lastName: z.string().trim().min(1, "Ingresa tus apellidos."),
});

export type ProfileNameInput = z.infer<typeof profileNameSchema>;

export function maskEmailForDisplay(email: string) {
  const [localPart, domain] = email.split("@");

  if (!localPart || !domain) {
    return email;
  }

  return `${localPart.slice(0, 2)}***@${domain}`;
}

export function formatDashboardUser(user: DashboardUserSource): DashboardUser {
  const name = user.firstName.trim();
  const initial = (name || user.email).trim().charAt(0).toUpperCase();

  return {
    name,
    email: maskEmailForDisplay(user.email),
    initial,
    profileImagePath: user.profileImagePath ?? null,
  };
}
