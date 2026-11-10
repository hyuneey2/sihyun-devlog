import { DatabaseSync } from "node:sqlite";

// Runs the production seed SQL against real SQLite, with D1's atomic batch API.
export function createLocalD1() {
  const db = new DatabaseSync(":memory:");
  db.exec(`
    CREATE TABLE blog_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE posts (
      id TEXT PRIMARY KEY, slug TEXT UNIQUE NOT NULL, title TEXT NOT NULL,
      description TEXT NOT NULL, content TEXT NOT NULL, category TEXT NOT NULL,
      tags TEXT NOT NULL, series TEXT, series_order INTEGER, status TEXT NOT NULL,
      published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      author_email TEXT NOT NULL
    );
  `);
  let failNextBatch = false;
  const d1 = {
    prepare(sql) {
      let params = [];
      const statement = {
        bind(...values) {
          params = values;
          return statement;
        },
        async all() {
          return { results: db.prepare(sql).all(...params), success: true };
        },
        async first() {
          return db.prepare(sql).get(...params) ?? null;
        },
        async run() {
          return statement.execute();
        },
        execute() {
          const result = db.prepare(sql).run(...params);
          return {
            success: true,
            results: [],
            meta: { changes: Number(result.changes) },
          };
        },
      };
      return statement;
    },
    async batch(statements) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const results = statements.map((statement, index) => {
          const result = statement.execute();
          if (failNextBatch && index === 0) {
            failNextBatch = false;
            throw new Error("injected D1 failure");
          }
          return result;
        });
        db.exec("COMMIT");
        return results;
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
  };
  return {
    db,
    d1,
    failBatch() {
      failNextBatch = true;
    },
  };
}
