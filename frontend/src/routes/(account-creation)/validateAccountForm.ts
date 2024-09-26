export function validateAccountForm(type: "login" | "register", formData: FormData): FormValidation {
    let missingEmail = false, missingPassword = false, passwordMismatch = false;

    const email = formData.get("email")?.toString();
    if (!email || email.length === 0) missingEmail = true;

    const password = formData.get("password")?.toString();
    if (!password || password.length === 0) missingPassword = true;

    if (type === "register") {
        const confirm = formData.get("confirm_password")?.toString();
        if (!confirm || password !== confirm) passwordMismatch = true;
    }

    if (missingEmail || missingPassword || type === "register" && passwordMismatch) {
        return { valid: false, failures: { missingEmail, missingPassword, passwordMismatch }}
    }

    return { valid: true, data: { email: email!, password: password! }}
}

type FormValidation = {
    valid: true,
    data: {
        email: string,
        password: string
    }
} | {
    valid: false,
    failures: {
        missingEmail: boolean
        missingPassword: boolean
        passwordMismatch?: boolean
    }
}