const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Email is required";
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return "Enter a valid email address";
  }
  return null;
}

export function validatePassword(value: string): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Password is required";
  }

  if (trimmed.length < 8) {
    return "Password must be at least 8 characters";
  }

  if (!/[A-Za-z]/.test(trimmed) || !/[0-9]/.test(trimmed)) {
    return "Password must include letters and numbers";
  }

  return null;
}

export function validateConfirmPassword(password: string, confirm: string): string | null {
  if (!confirm.trim()) {
    return "Please confirm your password";
  }
  if (password !== confirm) {
    return "Passwords do not match";
  }
  return null;
}

