export type PasswordRequirement = {
  label: string;
  labelKey: string;
  isMet: boolean;
};

const MIN_PASSWORD_LENGTH = 8;

const UPPERCASE_REGEX = /\p{Lu}/u;
const NUMBER_REGEX = /[0-9]/;
const SPECIAL_CHARACTER_REGEX = /[\p{P}\p{S}]/u;
const WHITESPACE_REGEX = /\s/u;

export function getPasswordRequirements(
  password: string,
): PasswordRequirement[] {
  const passwordLength = Array.from(password).length;

  return [
    {
      label: "Al menos una letra mayúscula",
      labelKey: "passwordRequirements.uppercase",
      isMet: UPPERCASE_REGEX.test(password),
    },
    {
      label: "Al menos un número",
      labelKey: "passwordRequirements.number",
      isMet: NUMBER_REGEX.test(password),
    },
    {
      label: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
      labelKey: "passwordRequirements.length",
      isMet: passwordLength >= MIN_PASSWORD_LENGTH,
    },
    {
      label: "Al menos un carácter especial",
      labelKey: "passwordRequirements.special",
      isMet: SPECIAL_CHARACTER_REGEX.test(password),
    },
    {
      label: "Sin espacios",
      labelKey: "passwordRequirements.noSpaces",
      isMet: password.length > 0 && !WHITESPACE_REGEX.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRequirements(password).every(
    (requirement) => requirement.isMet,
  );
}

export function shouldShowPasswordMismatch(
  password: string,
  repeatPassword: string,
): boolean {
  return repeatPassword.length > 0 && repeatPassword !== password;
}
