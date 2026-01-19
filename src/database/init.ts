import { getDatabase } from './connection'

export const initTables = (): void => {
  const db = getDatabase()

  // users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
}

export default initTables
