export function isPasswordStrong(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password) &&
    /[^a-zA-Z0-9]/.test(password)
  );
}

export function validatePassword(
  password: string,
  { requireStrong = false }: { requireStrong?: boolean } = {}
) {
  if (!password) {
    return { valid: false, error: "Password required!" };
  }
  if (requireStrong && !isPasswordStrong(password)) {
    return {
      valid: false,
      warning:
        "Your password is weak. Use at least 8 characters, letters, numbers, and special symbols.",
    };
  }
  return { valid: true };
}
