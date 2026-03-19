import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { authRoutes } from "./routes/auth.routes";
import { postRoutes } from "./routes/post.routes";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Mini Twitter API",
          version: "1.0.0",
          description: "API para uma mini rede social focada em simplicidade e seguranca.",
        },
      },
    }),
  )
  .use(cors())
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET || "super-secret-key",
    }),
  )
  .onError(({ code, error, set }) => {
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: "Erro de validacao",
        message: "Os dados enviados sao invalidos ou estao incompletos.",
        details: error.all.map((validationError) => ({
          field: validationError.path.substring(1),
          message: validationError.message,
        })),
      };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Recurso nao encontrado" };
    }

    console.error(error);
    return { error: "Erro interno do servidor", message: "Ocorreu um problema inesperado." };
  })
  .use(authRoutes)
  .use(postRoutes);

export type App = typeof app;
