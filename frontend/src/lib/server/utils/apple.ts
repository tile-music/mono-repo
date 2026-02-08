import { readFile } from "node:fs/promises";
import { SignJWT, importPKCS8 } from "jose";
import { log } from "$lib/log";
import {
    APPLE_MEDIA_KEY_PATH,
    APPLE_MEDIA_KEY_ID,
    APPLE_TEAM_ID,
    APP_URL,
} from "$env/static/private";

const MAX_TOKEN_AGE = 60 * 60 * 24; // 1 day

let cachedToken: string | null = null;
let cachedExp = 0;

if (
    !APPLE_MEDIA_KEY_ID ||
    !APPLE_MEDIA_KEY_PATH ||
    !APPLE_TEAM_ID ||
    !APP_URL
) {
    log(
        1,
        "One of the following required environment variables are not defined: " +
            "APPLE_MEDIA_KEY_ID, APPLE_MEDIA_KEY_PATH, APPLE_TEAM_ID, APP_URL",
    );
}

export async function getAppleMusicDeveloperToken() {
    const now = Math.floor(Date.now() / 1000);

    // Reuse token if still valid (with safety margin)
    if (cachedToken && cachedExp - now > 60 * 60) {
        return cachedToken;
    }

    const privateKeyPem = await readFile(APPLE_MEDIA_KEY_PATH, "utf8");
    const privateKey = await importPKCS8(privateKeyPem, "ES256");

    const exp = now + MAX_TOKEN_AGE;

    const token = await new SignJWT({
        origin: [APP_URL],
    })
        .setProtectedHeader({
            alg: "ES256",
            kid: APPLE_MEDIA_KEY_ID,
        })
        .setIssuedAt(now)
        .setExpirationTime(exp)
        .setIssuer(APPLE_TEAM_ID)
        .sign(privateKey);

    cachedToken = token;
    cachedExp = exp;

    return token;
}
