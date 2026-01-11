import { render, screen } from "@testing-library/svelte";
import AccountForm from "./AccountForm.svelte";

describe("Test login form functionality", async () => {
    beforeEach(() => {
        render(AccountForm, { type: "login" });
    });

    test("Email field should be present", async () => {
        const emailInput = screen.getByPlaceholderText("email");
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toBeEnabled();
    });

    test("Password field should be present", async () => {
        const passwordInput = screen.getByPlaceholderText("password");
        expect(passwordInput).toBeInTheDocument();
        expect(passwordInput).toBeEnabled();
    });

    test("Login button should be present", async () => {
        expect(screen.getByDisplayValue("log in")).toBeInTheDocument();
    });

    test("Link should direct to registration", async () => {
        const link = screen.getByText("don't have an account?");
        expect(link).toBeInTheDocument();
        expect(link).toBeInstanceOf(HTMLAnchorElement);

        const linkElement = link as HTMLAnchorElement;
        expect(linkElement.href).toContain("register");
    });
});

describe("Test register form functionality", async () => {
    beforeEach(() => {
        render(AccountForm, { type: "register" });
    });

    test("Email field should be present", async () => {
        const emailInput = screen.getByPlaceholderText("email");
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toBeEnabled();
    });

    test("Password field should be present", async () => {
        const passwordInput = screen.getByPlaceholderText("password");
        expect(passwordInput).toBeInTheDocument();
        expect(passwordInput).toBeEnabled();
    });

    test("Confirm password field should be present", async () => {
        const confirmPasswordInput =
            screen.getByPlaceholderText("confirm password");
        expect(confirmPasswordInput).toBeInTheDocument();
        expect(confirmPasswordInput).toBeEnabled();
    });

    test("Register button should be present", async () => {
        expect(screen.getByDisplayValue("get started")).toBeInTheDocument();
    });

    test("Link should direct to login", async () => {
        const link = screen.getByText("already have an account?");
        expect(link).toBeInTheDocument();
        expect(link).toBeInstanceOf(HTMLAnchorElement);

        const linkElement = link as HTMLAnchorElement;
        expect(linkElement.href).toContain("login");
    });
});
