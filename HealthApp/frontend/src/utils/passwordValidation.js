// src/utils/passwordValidation.js
// Basic password validation rules.

const rules = [
    {
        name: "length",
        label: "At least 8 characters",
        test: (pwd) => pwd.length >= 8,
    },
    {
        name: "upper",
        label: "At least 1 uppercase letter",
        test: (pwd) => /[A-Z]/.test(pwd),
    },
    {
        name: "lower",
        label: "At least 1 lowercase letter",
        test: (pwd) => /[a-z]/.test(pwd),
    },
    {
        name: "number",
        label: "At least 1 number",
        test: (pwd) => /[0-9]/.test(pwd),
    },
    {
        name: "special",
        label: "At least 1 special character (!@#$...) ",
        test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
    },
];

export function validatePassword(pwd) {
    const results = rules.map((r) => ({ ...r, passed: r.test(pwd) }));
    const valid = results.every((r) => r.passed);
    return { valid, results };
}

export { rules as passwordRules };