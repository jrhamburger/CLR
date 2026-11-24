import { test, expect } from "@playwright/test";
import { apiUrl, requiredEnv } from "./helpers/environment.js";
import { getAccessToken } from "./helpers/apiAuth.js";

test("authenticated catalog search returns the expected cached song", async ({ request }) => {
  // Choose a known MusicBrainz catalog row already cached in the test database.
  const title = requiredEnv("TEST_EXPECTED_TRACK_TITLE");
  const artist = requiredEnv("TEST_EXPECTED_TRACK_ARTIST");
  const token = await getAccessToken(request);

  const response = await request.get(`${apiUrl.replace(/\/$/, "")}/api/catalog/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: process.env.TEST_CATALOG_QUERY || title },
  });

  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.tracks).toEqual(expect.arrayContaining([
    expect.objectContaining({ title, artist, source: "musicbrainz" }),
  ]));
});

test("authenticated catalog search rejects a blank query", async ({ request }) => {
  const token = await getAccessToken(request);

  const response = await request.get(`${apiUrl.replace(/\/$/, "")}/api/catalog/search`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { q: "   " },
  });

  expect(response.status()).toBe(400);
  expect(await response.json()).toEqual({ error: "A search query is required." });
});
