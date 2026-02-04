type FormValidation = {
    valid: boolean;
    data: {
        email?: string;
        password?: string;
        confirm?: string;
    };
    failures: {
        email: string;
        password: string;
        confirm: string;
        general: string;
    };
};

export function validateAccountForm(
    type: "login" | "register",
    formData: FormData,
): FormValidation {
    const data = {
        email: formData.get("email")?.toString(),
        password: formData.get("password")?.toString(),
        confirm: formData.get("confirm")?.toString(),
    };

    const failures = {
        email: "",
        password: "",
        confirm: "",
        general: "",
    };

    const email = data.email;
    if (!email || email.length === 0) failures.email = "Email is required";
    else failures.email = validateWellFormedEmail(email);

    const password = data.password;
    if (!password || password.length === 0)
        failures.password = "Password is required";
    else failures.password = validateWellFormedPassword(password);

    if (type === "register") {
        const confirm = data.confirm;
        if (!confirm || password !== confirm)
            failures.confirm = "Password does not match";
    }

    const valid =
        failures.email === "" &&
        failures.password === "" &&
        failures.confirm === "" &&
        failures.general === "";

    return {
        valid,
        data,
        failures,
    };
}

function validateWellFormedEmail(email: string) {
    const regex = /(.+)@(.+){2,}\.(.+){2,}/;
    return regex.test(email) ? "" : "Email is not well-formed";
}

function validateWellFormedPassword(password: string): string {
    if (password.length < 8) return "Password is too short";
    if (password.length > 32) return "Password is too long";

    if (!/\d/.test(password))
        return "Password must contain at least one number";

    return "";
}
