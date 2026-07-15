export type PasswordRequirement = {
  label: string;
  isMet: boolean;
};

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      label: "Al menos una letra mayúscula",
      isMet: /[A-ZÁÉÍÓÚÑ]/.test(password),
    },
    {
      label: "Al menos un número",
      isMet: /\d/.test(password),
    },
    {
      label: "Al menos 8 caracteres",
      isMet: password.length >= 8,
    },
    {
      label: "Al menos un carácter especial",
      isMet: /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ]/.test(password),
    },
    {
      label: "Sin espacios",
      isMet: password.length > 0 && !/\s/.test(password),
    },
  ];
}

export function shouldShowPasswordMismatch(
  password: string,
  repeatPassword: string,
) {
  return repeatPassword.length > 0 && repeatPassword !== password;
}
