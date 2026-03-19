import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "../services/auth.service";

const tokenLifetimeInSeconds = 60 * 60 * 24 * 7;

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key",
    }),
  )
  .post(
    "/register",
    async ({ body, set }) => {
      try {
        const user = AuthService.register(body.name, body.email, body.password);
        set.status = 201;
        return user;
      } catch {
        set.status = 400;
        return { error: "Usuario ja cadastrado ou dados invalidos" };
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 2 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 4 }),
      }),
      detail: { tags: ["Auth"] },
    },
  )
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const user = AuthService.login(body.email, body.password);

      if (!user) {
        set.status = 401;
        return { error: "Credenciais invalidas" };
      }

      const exp = Math.floor(Date.now() / 1000) + tokenLifetimeInSeconds;
      const token = await jwt.sign({
        sub: user.id.toString(),
        name: user.name,
        exp,
      });

      return {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      detail: { tags: ["Auth"] },
    },
  )
  .post(
    "/logout",
    async ({ jwt, headers: { authorization }, set }) => {
      if (!authorization) {
        set.status = 401;
        return { error: "Nao autorizado" };
      }

      const token = authorization.split(" ")[1];
      const payload = await jwt.verify(token);

      if (!payload) {
        set.status = 401;
        return { error: "Token invalido ou expirado" };
      }

      const expiresAt =
        typeof payload.exp === "number"
          ? payload.exp
          : Math.floor(Date.now() / 1000) + tokenLifetimeInSeconds;

      AuthService.blacklistToken(token, expiresAt);

      return { success: true, message: "Logout realizado com sucesso. Token invalidado." };
    },
    {
      detail: { tags: ["Auth"], summary: "Realiza logout e invalida o token atual" },
    },
  );
