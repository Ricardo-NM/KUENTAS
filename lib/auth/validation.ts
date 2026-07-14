import { z } from "zod";

export const invalidCredentialsMessage = "Alguno de los campos es incorrecto";
export const tooManyLoginAttemptsMessage =
  "Demasiados intentos fallidos, espera un momento";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

const emailSchema = z
  .string()
  .trim()
  .email("Ingresa un correo electrónico válido.")
  .transform(normalizeEmail);

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .regex(/[A-ZÁÉÍÓÚÑ]/, "La contraseña debe incluir una mayúscula.")
  .regex(/\d/, "La contraseña debe incluir un número.")
  .regex(
    /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ]/,
    "La contraseña debe incluir un carácter especial.",
  )
  .refine((value) => !/\s/.test(value), {
    message: "La contraseña no debe incluir espacios.",
  });

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "Ingresa tu nombre."),
    lastName: z.string().trim().min(1, "Ingresa tus apellidos."),
    email: emailSchema,
    password: passwordSchema,
    repeatPassword: z.string(),
  })
  .refine((value) => value.password === value.repeatPassword, {
    path: ["repeatPassword"],
    message: "Las contraseñas no coinciden.",
  });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, invalidCredentialsMessage),
  remember: z
    .union([z.literal("on"), z.literal("true"), z.literal(true)])
    .optional()
    .transform((value) => value === "on" || value === "true" || value === true),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
