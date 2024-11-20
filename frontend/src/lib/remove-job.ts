export async function removeJob(userId: string) {
  const response = await fetch("http://data-acquisition:3001/remove-job", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
      type: "spotify",
    }),
  });

  // Log response for debugging
  console.log("Response Status:", response.status);
  const responseBody = await response.text();
  console.log("Response Body:", responseBody);

  // Try parsing JSON if the status is OK
  if (response.ok) {
    return JSON.parse(responseBody);
  } else {
    throw new Error(`Error: ${response.status}, ${responseBody}`);
  }
}