import { render, screen } from '@testing-library/svelte';
import AccountForm from './AccountForm.svelte';

describe('Test login form functionality', async () => {
    beforeEach(() => {
        render(AccountForm, { type: "login"});
    });

    test('Login button should be present', async () => {
        expect(screen.getByDisplayValue('log in')).toBeInTheDocument();
    });

    test('Link should direct to registration', async () => {
        const link = screen.getByText("don't have an account?");
        expect(link).toBeInTheDocument();
        expect(link).toBeInstanceOf(HTMLAnchorElement);

        const linkElement = link as HTMLAnchorElement;
        expect(linkElement.href).toContain("register");
    });
});

describe('Test register form functionality', async () => {
    beforeEach(() => {
        render(AccountForm, { type: "register"});
    });

    test('Register button should be present', async () => {
        expect(screen.getByDisplayValue('get started')).toBeInTheDocument();
    });

    test('Link should direct to login', async () => {
        const link = screen.getByText("already have an account?");
        expect(link).toBeInTheDocument();
        expect(link).toBeInstanceOf(HTMLAnchorElement);

        const linkElement = link as HTMLAnchorElement;
        expect(linkElement.href).toContain("login");
    });
  });