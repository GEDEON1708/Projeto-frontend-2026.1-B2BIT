import { app } from "./app";

const server = app.listen(3000);

console.log(`Mini Twitter API running at ${server.hostname}:${server.port}`);
