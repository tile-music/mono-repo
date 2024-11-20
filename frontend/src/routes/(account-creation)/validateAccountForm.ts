export function validateAccountForm(type: "login" | "register", formData: FormData): FormValidation {
    const failures: Failures = {
        missingEmail: false,
        missingPassword: false,
        passwordMismatch: false,
        invalidEmail: false,
        invalidPassword: {
            tooShort: false,
            tooLong: false,
            noNumbers: false
        },
        alreadyTaken: false
    }

    const email = formData.get("email")?.toString();
    if (!email || email.length === 0) failures.missingEmail = true;
    else failures.invalidEmail = !validateWellFormedEmail(email);

    const password = formData.get("password")?.toString();
    if (!password || password.length === 0) failures.missingPassword = true;
    else failures.invalidPassword = validateWellFormedPassword(password);

    if (type === "register") {
        const confirm = formData.get("confirm_password")?.toString();
        if (!confirm || password !== confirm) failures.passwordMismatch = true;
    }

    const missingAttribute = failures.missingEmail || failures.missingPassword;
    const invalidPassword = failures.invalidPassword.tooLong || failures.invalidPassword.tooShort || failures.invalidPassword.noNumbers
    const malformedCredentials = failures.passwordMismatch || failures.invalidEmail || invalidPassword
    if (missingAttribute || type === "register" && malformedCredentials) return { valid: false, failures};

    return { valid: true, failures: failures, data: { email: email!, password: password! }}
}

function validateWellFormedEmail(email: string) {
    const regex = /(.+)@(.+){2,}\.(.+){2,}/
    return regex.test(email);
}

function validateWellFormedPassword(password: string): InvalidPassword {
    const invalidPassword: InvalidPassword = {
        tooShort: false,
        tooLong: false,
        noNumbers: false,
    }

    if (password.length < 8) invalidPassword.tooShort = true;
    if (password.length > 64) invalidPassword.tooLong = true;

    const regex = /\d/;
    invalidPassword.noNumbers = !regex.test(password);

    return invalidPassword;
}

type FormValidation = {
    valid: true,
    failures: Failures,
    data: {
        email: string,
        password: string
    }
} | {
    valid: false,
    failures: Failures
}

export type Failures = {
    missingEmail: boolean
    missingPassword: boolean
    passwordMismatch: boolean
    invalidEmail: boolean
    invalidPassword: InvalidPassword
    alreadyTaken: boolean
}

type InvalidPassword = {
    tooShort: boolean
    tooLong: boolean
    noNumbers: boolean
}