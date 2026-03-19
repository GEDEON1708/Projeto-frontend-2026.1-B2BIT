import { beforeEach, describe, expect, it } from "bun:test";
import { app } from "../src/app";
import { seedDatabase, seedUsers } from "../src/data/seed-data";

function request(path: string, init?: Omit<RequestInit, "body"> & { body?: unknown }) {
  const headers = new Headers(init?.headers);
  const hasBody = init?.body !== undefined;

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return new Request(`http://localhost${path}`, {
    ...init,
    headers,
    body: hasBody ? JSON.stringify(init?.body) : undefined,
  });
}

async function responseJson<T>(response: Response) {
  return (await response.json()) as T;
}

describe("Mini Twitter API", () => {
  beforeEach(() => {
    seedDatabase();
  });

  it("returns richer seeded posts and supports searching by title, content and author", async () => {
    const feedResponse = await app.handle(request("/posts"));
    const feedBody = await responseJson<{
      posts: Array<{ title: string; authorName: string; likesCount: number }>;
      total: number;
    }>(feedResponse);

    expect(feedResponse.status).toBe(200);
    expect(feedBody.total).toBeGreaterThanOrEqual(10);
    expect(feedBody.posts[0]?.title).toBe("Visca Barca");
    expect(feedBody.posts.some((post) => post.authorName === "Gedeon Kalala Kashomona")).toBe(true);

    const contentSearchResponse = await app.handle(request("/posts?search=Newcastle"));
    const contentSearchBody = await responseJson<{ posts: Array<{ title: string }> }>(
      contentSearchResponse,
    );

    expect(contentSearchResponse.status).toBe(200);
    expect(contentSearchBody.posts.map((post) => post.title)).toContain("Visca Barca");

    const authorSearchResponse = await app.handle(request("/posts?search=Gedeon"));
    const authorSearchBody = await responseJson<{ posts: Array<{ authorName: string }> }>(
      authorSearchResponse,
    );

    expect(authorSearchResponse.status).toBe(200);
    expect(authorSearchBody.posts.every((post) => post.authorName === "Gedeon Kalala Kashomona")).toBe(
      true,
    );
  });

  it("allows a seeded demo user to log in", async () => {
    const demoUser = seedUsers.find((user) => user.key === "gedeon");

    if (!demoUser) {
      throw new Error("Seeded demo user not found");
    }

    const loginResponse = await app.handle(
      request("/auth/login", {
        method: "POST",
        body: {
          email: demoUser.email,
          password: demoUser.password,
        },
      }),
    );
    const loginBody = await responseJson<{ token: string; user: { name: string; email: string } }>(
      loginResponse,
    );

    expect(loginResponse.status).toBe(200);
    expect(loginBody.user.name).toBe("Gedeon Kalala Kashomona");
    expect(loginBody.user.email).toBe(demoUser.email);
    expect(loginBody.token.length).toBeGreaterThan(20);
  });

  it("covers register, login, create, update, like, delete and logout", async () => {
    const email = `qa-${Date.now()}@example.com`;

    const registerResponse = await app.handle(
      request("/auth/register", {
        method: "POST",
        body: {
          name: "QA Runner",
          email,
          password: "password123",
        },
      }),
    );
    const registerBody = await responseJson<{ id: number; name: string; email: string }>(
      registerResponse,
    );

    expect(registerResponse.status).toBe(201);
    expect(registerBody.email).toBe(email);

    const loginResponse = await app.handle(
      request("/auth/login", {
        method: "POST",
        body: {
          email,
          password: "password123",
        },
      }),
    );
    const loginBody = await responseJson<{ token: string; user: { id: number } }>(loginResponse);

    expect(loginResponse.status).toBe(200);
    expect(loginBody.token.length).toBeGreaterThan(20);

    const authHeaders = {
      Authorization: `Bearer ${loginBody.token}`,
    };

    const createResponse = await app.handle(
      request("/posts", {
        method: "POST",
        headers: authHeaders,
        body: {
          title: "Post de teste",
          content: "Validando o fluxo completo de autenticacao e timeline.",
          image: "https://example.com/post.png",
        },
      }),
    );
    const createdPost = await responseJson<{ id: number; title: string }>(createResponse);

    expect(createResponse.status).toBe(200);
    expect(createdPost.title).toBe("Post de teste");

    const updateResponse = await app.handle(
      request(`/posts/${createdPost.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: {
          title: "Post atualizado",
          content: "Fluxo autenticado revisado e funcionando.",
          image: "https://example.com/post-updated.png",
        },
      }),
    );
    const updateBody = await responseJson<{ success: boolean }>(updateResponse);

    expect(updateResponse.status).toBe(200);
    expect(updateBody.success).toBe(true);

    const likeResponse = await app.handle(
      request("/posts/1/like", {
        method: "POST",
        headers: authHeaders,
      }),
    );
    const likeBody = await responseJson<{ liked: boolean }>(likeResponse);

    expect(likeResponse.status).toBe(200);
    expect(likeBody.liked).toBe(true);

    const unlikeResponse = await app.handle(
      request("/posts/1/like", {
        method: "POST",
        headers: authHeaders,
      }),
    );
    const unlikeBody = await responseJson<{ liked: boolean }>(unlikeResponse);

    expect(unlikeResponse.status).toBe(200);
    expect(unlikeBody.liked).toBe(false);

    const deleteResponse = await app.handle(
      request(`/posts/${createdPost.id}`, {
        method: "DELETE",
        headers: authHeaders,
      }),
    );
    const deleteBody = await responseJson<{ success: boolean }>(deleteResponse);

    expect(deleteResponse.status).toBe(200);
    expect(deleteBody.success).toBe(true);

    const logoutResponse = await app.handle(
      request("/auth/logout", {
        method: "POST",
        headers: authHeaders,
      }),
    );
    const logoutBody = await responseJson<{ success: boolean }>(logoutResponse);

    expect(logoutResponse.status).toBe(200);
    expect(logoutBody.success).toBe(true);

    const blacklistedResponse = await app.handle(
      request("/posts", {
        method: "POST",
        headers: authHeaders,
        body: {
          title: "Nao deveria criar",
          content: "Token invalido apos logout.",
        },
      }),
    );
    const blacklistedBody = await responseJson<{ error: string }>(blacklistedResponse);

    expect(blacklistedResponse.status).toBe(401);
    expect(blacklistedBody.error.toLowerCase()).toContain("token");
  });
});
