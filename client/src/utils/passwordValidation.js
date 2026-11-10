export const passwordRequirements = [
  { key: "length", label: "At least 8 characters", test: (value) => value.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { key: "lowercase", label: "One lowercase letter", test: (value) => /[a-z]/.test(value) },
  { key: "number", label: "One number", test: (value) => /[0-9]/.test(value) },
  { key: "special", label: "One special character", test: (value) => /[^A-Za-z0-9\s]/.test(value) },
];

export const getPasswordRequirementStatus = (password = "") =>
  passwordRequirements.map((requirement) => ({
    key: requirement.key,
    label: requirement.label,
    valid: requirement.test(password),
  }));

export const isStrongPassword = (password = "") =>
  typeof password === "string" &&
  password.length <= 128 &&
  getPasswordRequirementStatus(password).every((requirement) => requirement.valid);
