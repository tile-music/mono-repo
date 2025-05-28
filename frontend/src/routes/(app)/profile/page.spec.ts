import { render, screen } from "@testing-library/svelte";
import Page from "./+page.svelte";

const testData = {
    session: null,
    cookies: [],
    profile: {
        updated_at: "2025-05-25 03:02:01.877+00",
        username: "testuser",
        full_name: "john smith",
        website: "www.example.com",
        avatar_url: null,
    },
    email: "test@test.com",
};

describe("Test profile page component", async () => {
    test("Page renders", async () => {
        render(Page, { data: testData });
        expect(
            screen.getByRole("heading", { name: "profile" }),
        ).toBeInTheDocument();
    });

    test("Profile info is placed in correct inputs", async () => {
        render(Page, { data: testData });
        expect(
            screen.getByDisplayValue(testData.profile.username),
        ).toHaveAttribute("name", "username");
        expect(
            screen.getByDisplayValue(testData.profile.full_name),
        ).toHaveAttribute("name", "full name");
        expect(screen.getByDisplayValue(testData.profile.website)).toHaveAttribute(
            "name",
            "website",
        );
    });

    test("Email is visible", async () => {
        render(Page, { data: testData });
        expect(
            screen.getByText(testData.email, { exact: false }),
        ).toBeInTheDocument();
    });
});

const noData = {
    session: null,
    cookies: [],
    user: {
        updated_at: null,
        username: null,
        full_name: null,
        website: null,
        avatar_url: null,
    },
    email: null,
};

describe("Test profile page component with missing or incomplete data", async () => {
    test("Page renders with no data", async () => {
        render(Page, { data: noData });
        expect(
            screen.getByRole("heading", { name: "profile" }),
        ).toBeInTheDocument();
    });

    // no need to test for empty profile info inputs,
    // as they are not rendered if no data is present
    // test("Profile info has appropriate placeholder text", async () => {
    //     render(Page, { data: noData });
    //     expect(screen.getByPlaceholderText("username")).toBeInTheDocument();
    //     expect(screen.getByPlaceholderText("full name")).toBeInTheDocument();
    //     expect(screen.getByPlaceholderText("website")).toBeInTheDocument();
    // });

    test("Email has appropriate placeholder value", async () => {
        render(Page, { data: noData });
        expect(screen.getByText("[no email found]")).toBeInTheDocument();
    });
});
