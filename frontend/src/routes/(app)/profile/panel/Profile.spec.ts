import { render, screen } from "@testing-library/svelte";
import Profile from "./Profile.svelte";

const testProfile = {
    updated_at: "2025-05-25 03:02:01.877+00",
    username: "testuser",
    full_name: "john smith",
    website: "www.example.com",
    avatar_url: null,
};

describe("Test profile page component", async () => {
    test("Page renders", async () => {
        render(Profile, { profile: testProfile });
        expect(
            screen.getByRole("heading", { name: "profile" }),
        ).toBeInTheDocument();
    });

    test("Profile info is placed in correct inputs", async () => {
        render(Profile, { profile: testProfile });
        expect(
            screen.getByDisplayValue(testProfile.username),
        ).toHaveAttribute("name", "username");
        expect(
            screen.getByDisplayValue(testProfile.full_name),
        ).toHaveAttribute("name", "full name");
        expect(
            screen.getByDisplayValue(testProfile.website)
        ).toHaveAttribute("name", "website");
    });
});

const noProfile = {
    updated_at: null,
    username: null,
    full_name: null,
    website: null,
    avatar_url: null,
};

describe("Test profile page component with missing or incomplete data", async () => {
    test("Page renders with no data", async () => {
        render(Profile, { profile: noProfile });
        expect(
            screen.getByRole("heading", { name: "profile" }),
        ).toBeInTheDocument();
    });
});
