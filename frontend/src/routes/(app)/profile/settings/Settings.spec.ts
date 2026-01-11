import { render, screen } from "@testing-library/svelte";
import Settings from "./Settings.svelte";

const testEmail = "test@test.com";

describe("Test settings panel component", async () => {
    test("Email is visible", async () => {
        render(Settings, { email: testEmail });
        expect(
            screen.getByText(testEmail, { exact: false }),
        ).toBeInTheDocument();
    });
});

describe("Test profile page component with missing or incomplete data", async () => {
    test("Page renders with no data", async () => {
        render(Settings, { email: null });
        expect(
            screen.getByRole("heading", { name: "settings" }),
        ).toBeInTheDocument();
    });
    
    test("Email has appropriate placeholder value", async () => {
        render(Settings, { email: null });
        expect(screen.getByText("[no email found]")).toBeInTheDocument();
    });
});
