import { db } from "../db";

type SeedUser = {
  key: string;
  name: string;
  email: string;
  password: string;
};

type SeedPost = {
  title: string;
  content: string;
  authorKey: SeedUser["key"];
  image?: string | null;
  minutesAgo: number;
  likesBy: SeedUser["key"][];
};

export const seedUsers: SeedUser[] = [
  {
    key: "gedeon",
    name: "Gedeon Kalala Kashomona",
    email: "gedeon@example.com",
    password: "password123",
  },
  {
    key: "alice",
    name: "Alice Silva",
    email: "alice@example.com",
    password: "password123",
  },
  {
    key: "bruno",
    name: "Bruno Santos",
    email: "bruno@example.com",
    password: "password123",
  },
  {
    key: "mariana",
    name: "Mariana Costa",
    email: "mariana@example.com",
    password: "password123",
  },
  {
    key: "rafael",
    name: "Rafael Oliveira",
    email: "rafael@example.com",
    password: "password123",
  },
];

export const seedPosts: SeedPost[] = [
  {
    title: "Visca Barca",
    content:
      "Visca Barca! FC Barcelona 7-2 Newcastle nas oitavas de final. Noite para guardar na memoria. 💙❤️",
    authorKey: "gedeon",
    minutesAgo: 5,
    likesBy: ["alice", "mariana", "rafael"],
  },
  {
    title: "Chuva e cafe",
    content:
      "Tem dias em que tudo melhora com janela aberta, chuva caindo la fora e uma caneca de cafe bem forte na mesa.",
    authorKey: "alice",
    minutesAgo: 18,
    likesBy: ["gedeon", "bruno"],
  },
  {
    title: "Hamburguer da madrugada",
    content:
      "Descobri uma hamburgueria pequena ontem e ainda estou pensando naquele pao macio, cebola caramelizada e molho da casa.",
    authorKey: "bruno",
    minutesAgo: 34,
    likesBy: ["alice", "mariana", "rafael"],
  },
  {
    title: "Ceu limpo hoje",
    content:
      "Lua bem nitida, poucas nuvens e aquele silencio bom no fim da noite. Da vontade de ficar mais tempo olhando para o ceu.",
    authorKey: "rafael",
    minutesAgo: 49,
    likesBy: ["alice", "gedeon"],
  },
  {
    title: "Filme que surpreendeu",
    content:
      "Fui ver um filme sem esperar muito e saí pensando na trilha sonora e na fotografia o resto da noite inteira.",
    authorKey: "mariana",
    minutesAgo: 63,
    likesBy: ["bruno", "alice"],
  },
  {
    title: "Feira de domingo",
    content:
      "Passei na feira cedo, comprei manga, abacaxi e ainda encontrei pastel quente. Programa simples que sempre vale a pena.",
    authorKey: "alice",
    minutesAgo: 85,
    likesBy: ["gedeon", "rafael", "mariana"],
  },
  {
    title: "Playlist para estrada",
    content:
      "Tem musica que foi feita para pegar estrada ao entardecer. Janela meio aberta, vento entrando e refrão cantado alto.",
    authorKey: "mariana",
    minutesAgo: 111,
    likesBy: ["alice"],
  },
  {
    title: "Livro que prende",
    content:
      "Quando o livro e bom de verdade a gente fala que vai ler um capitulo e percebe que ja passou de meia-noite.",
    authorKey: "gedeon",
    minutesAgo: 142,
    likesBy: ["alice", "bruno", "rafael"],
  },
  {
    title: "Pedalada no fim da tarde",
    content:
      "Peguei a bicicleta so para espairecer e acabei vendo um por do sol bonito demais perto da pracinha do bairro.",
    authorKey: "rafael",
    minutesAgo: 177,
    likesBy: ["gedeon", "mariana"],
  },
  {
    title: "Cachorro da vizinha",
    content:
      "O cachorro da vizinha ja reconhece o barulho do portao e vem correndo como se eu tivesse petisco todo dia.",
    authorKey: "bruno",
    minutesAgo: 224,
    likesBy: ["alice", "gedeon"],
  },
];

type SeedResult = {
  users: Array<Omit<SeedUser, "key" | "password"> & { id: number }>;
  postsCount: number;
};

function toSqliteDate(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

export function resetDatabase() {
  db.run("DELETE FROM likes");
  db.run("DELETE FROM posts");
  db.run("DELETE FROM tokens_blacklist");
  db.run("DELETE FROM users");
  db.run("DELETE FROM sqlite_sequence WHERE name IN ('users', 'posts', 'likes', 'tokens_blacklist')");
}

export function seedDatabase(): SeedResult {
  resetDatabase();

  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?) RETURNING id",
  );
  const insertPost = db.prepare(
    "INSERT INTO posts (title, content, image, authorId, createdAt) VALUES (?, ?, ?, ?, ?) RETURNING id",
  );
  const insertLike = db.prepare("INSERT OR IGNORE INTO likes (postId, userId) VALUES (?, ?)");

  const userIdByKey = new Map<SeedUser["key"], number>();
  const createdUsers = seedUsers.map((user) => {
    const result = insertUser.get(user.name, user.email, user.password) as { id: number };
    userIdByKey.set(user.key, result.id);

    return {
      id: result.id,
      name: user.name,
      email: user.email,
    };
  });

  const now = Date.now();

  seedPosts.forEach((post) => {
    const authorId = userIdByKey.get(post.authorKey);

    if (!authorId) {
      throw new Error(`Missing seeded author for key: ${post.authorKey}`);
    }

    const createdAt = toSqliteDate(new Date(now - post.minutesAgo * 60_000));
    const insertedPost = insertPost.get(
      post.title,
      post.content,
      post.image ?? null,
      authorId,
      createdAt,
    ) as { id: number };

    post.likesBy.forEach((userKey) => {
      const userId = userIdByKey.get(userKey);

      if (!userId) {
        throw new Error(`Missing like user for key: ${userKey}`);
      }

      insertLike.run(insertedPost.id, userId);
    });
  });

  return {
    users: createdUsers,
    postsCount: seedPosts.length,
  };
}
