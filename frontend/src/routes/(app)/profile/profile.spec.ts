import { assembleBlankProfile } from "./profile";

const USERID = genHexString(32);

describe("Test profile initialization", async () => {
    test("A valid blank profile can be created", async () => {
        const now = new Date();
        const profile = assembleBlankProfile(USERID, "test@test.com");

        expect(profile.id).toBe(USERID);
        expect(profile.username).toBe("test");
        expect(now.getTime() - profile.updated_at.getTime()).toBeLessThan(1000);
        expect(profile.full_name).toBeNull();
        expect(profile.website).toBeNull();
        expect(profile.avatar_url).toBeNull();
    });

    test("Username is blank if email is not provided", async () => {
        const profile = assembleBlankProfile(USERID);
        expect(profile.username).toBe(null);
    });

    test("Username is blank if local-part of email is too short", async () => {
        const profile = assembleBlankProfile(USERID, "t@test.com");
        expect(profile.username).toBe(null);
    });

    test("Username is valid if local-part of email is exactly three characters", async () => {
        const profile = assembleBlankProfile(USERID, "xyz@test.com");
        expect(profile.username).toBe("xyz");
    });

    test("Username is still valid if domain is shorter than three characters", async () => {
        const profile = assembleBlankProfile(USERID, "foo@ab");
        expect(profile.username).toBe("foo");
    });
});

function genHexString(len: number) {
    let output = "";
    for (let i = 0; i < len; ++i) {
        output += Math.floor(Math.random() * 16).toString(16);
    }
    return output;
}
