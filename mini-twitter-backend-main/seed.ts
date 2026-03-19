import { seedDatabase } from "./src/data/seed-data";

console.log("Populando o banco de dados...");

const result = seedDatabase();

console.log(`${result.users.length} usuarios criados.`);
console.log(`${result.postsCount} posts criados.`);
console.log("Banco de dados populado com sucesso.");
