import { assertEquals } from "jsr:@std/assert";

const TEST_PORT = 3001;
const BASE_URL = `http://localhost:${TEST_PORT}`;

Deno.test("GET /add-job - should fail with 404", async () => {
  const response = await fetch(`${BASE_URL}/add-job`, {
    method: "GET"
  });
  await response.text();

  assertEquals(response.status, 404);
});

Deno.test("GET /remove-job - should fail with 404", async () => {
  const response = await fetch(`${BASE_URL}/remove-job`, {
    method: "GET"
  });
  await response.text();

  assertEquals(response.status, 404);
});

Deno.test("POST /add-job - successful spotify job", async () => {
  const response = await fetch(`${BASE_URL}/add-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "test-user-123",
      refreshToken: "test-refresh-token",
      type: "spotify"
    })
  });

  assertEquals(response.status, 200);
  const body = await response.json();
  assertEquals(body.message, "Job added successfully");
});

Deno.test("POST /add-job - missing parameters", async () => {
  const response = await fetch(`${BASE_URL}/add-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "test-user-123"
      // Missing refreshToken and type
    })
  });

  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Missing userId, refreshToken, or cronExpression");
});

Deno.test("POST /add-job - invalid type", async () => {
  const response = await fetch(`${BASE_URL}/add-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "test-user-123",
      refreshToken: "test-refresh-token",
      type: "invalid-type"
    })
  });

  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Invalid type");
});

Deno.test("POST /remove-job - successful removal", async () => {
  const response = await fetch(`${BASE_URL}/remove-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "test-user-123",
      type: "spotify"
    })
  });

  assertEquals(response.status, 200);
  const body = await response.json();
  assertEquals(body.message, "Job removed successfully");
});

Deno.test("POST /remove-job - missing parameters", async () => {
  const response = await fetch(`${BASE_URL}/remove-job`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "test-user-123"
      // Missing type
    })
  });

  assertEquals(response.status, 400);
  const body = await response.json();
  assertEquals(body.error, "Missing userId, refreshToken, or cronExpression");
});