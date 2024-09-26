import { validateAccountForm } from './validateAccountForm';

const validPassword = "Test1Password!" // may change based on password complexity restraints

describe('Test login form validation', async () => {
    test('User must enter email', async () => {
        const formData = new FormData();
        formData.append("password", validPassword);
        let form = validateAccountForm("login", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingEmail).toBe(true)
    });

    test('Email must not be an empty string', async () => {
        const formData = new FormData();
        formData.append("email", "");
        formData.append("password", validPassword);
        let form = validateAccountForm("login", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingEmail).toBe(true)
    });

    test('User must enter password', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com");
        let form = validateAccountForm("login", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingPassword).toBe(true)
    });

    test('Password must not be an empty string', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com");
        formData.append("password", "");
        let form = validateAccountForm("login", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingPassword).toBe(true)
    });

    test('Valid inputs must be accepted', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com");
        formData.append("password", validPassword);
        let form = validateAccountForm("login", formData);

        expect(form.valid).toBe(true)
        if (!form.valid) return
        expect(form.data.email).toBe("test@test.com")
        expect(form.data.password).toBe(validPassword)
    });
});

describe('Test register form validation', async () => {
    test('User must enter email', async () => {
        const formData = new FormData();
        formData.append("password", validPassword);
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingEmail).toBe(true)
    });

    test('Email must not be an empty string', async () => {
        const formData = new FormData();
        formData.append("email", "");
        formData.append("password", validPassword);
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingEmail).toBe(true)
    });

    test('User must enter password', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com");
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingPassword).toBe(true)
    });

    test('Password must not be an empty string', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com");
        formData.append("password", "");
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.missingPassword).toBe(true)
    });

    test('Passwords must match', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com");
        formData.append("password", "TestPassword1!");
        formData.append("confirm_password", "TestPassword2!");
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.passwordMismatch).toBe(true)
    });    

    test('Valid inputs must be accepted', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com");
        formData.append("password", validPassword);
        formData.append("confirm_password", validPassword);
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(true)
        if (!form.valid) return
        expect(form.data.email).toBe("test@test.com")
        expect(form.data.password).toBe(validPassword)
    });
});

describe('Test for well-formed email', async () => {
    test('Email must include an @ sign', async () => {
        const formData = new FormData();
        formData.append("email", "test.com")
        formData.append("password", validPassword);
        formData.append("confirm_password", validPassword);
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.invalidEmail).toBe(true)
    });

    test('Email must include a top-level domain (.)', async () => {
        const formData = new FormData();
        formData.append("email", "test@test")
        formData.append("password", validPassword);
        formData.append("confirm_password", validPassword);
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.invalidEmail).toBe(true)
    });

    test('Valid emails must be accepted', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com")
        formData.append("password", validPassword);
        formData.append("confirm_password", validPassword);
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(true)
    });
});

describe('Test for well-formed password', async () => {
    test('Password must be at least eight characters', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com")
        formData.append("password", "test");
        formData.append("confirm_password", "test");
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.invalidPassword.tooShort).toBe(true)
    });

    test('Password must be under sixty-four characters', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com")
        formData.append("password", "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest1");
        formData.append("confirm_password", "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttest1");
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.invalidPassword.tooLong).toBe(true)
    });

    test('Password must contain a number', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com")
        formData.append("password", "testnonumber");
        formData.append("confirm_password", "testnonumber");
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(false)
        if (form.valid) return
        expect(form.failures.invalidPassword.noNumbers).toBe(true)
    });

    test('Valid passwords must be accepted', async () => {
        const formData = new FormData();
        formData.append("email", "test@test.com")
        formData.append("password", validPassword);
        formData.append("confirm_password", validPassword);
        let form = validateAccountForm("register", formData);

        expect(form.valid).toBe(true)
    });
});
