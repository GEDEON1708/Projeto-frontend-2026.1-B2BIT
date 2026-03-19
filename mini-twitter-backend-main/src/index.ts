import { app } from "./app";
import { seedDatabase } from "./data/seed-data";
import { db, databasePath } from "./db";

function ensureSeedData() {
  const usersCount = (db.prepare("SELECT COUNT(*) as total FROM users").get() as { total: number }).total;
  const postsCount = (db.prepare("SELECT COUNT(*) as total FROM posts").get() as { total: number }).total;

  if (usersCount === 0 && postsCount === 0) {
    seedDatabase();
    console.log("Seed inicial aplicado automaticamente.");
  }
}

ensureSeedData();

const port = Number(process.env.PORT || 3000);
const hostname = process.env.HOST || "0.0.0.0";

const server = app.listen({
  port,
  hostname,
});

console.log(`Mini Twitter API running at ${server.hostname}:${server.port}`);
console.log(`Database path: ${databasePath}`);
