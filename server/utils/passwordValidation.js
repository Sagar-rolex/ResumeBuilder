export const isStrongPassword = (password) =>
  typeof password === "string" &&
  password.length >= 8 &&
  password.length <= 128 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[^A-Za-z0-9\s]/.test(password);
