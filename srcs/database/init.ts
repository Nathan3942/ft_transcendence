import { getDatabase } from './connection'

export const initTables = (): void => {
  const db = getDatabase()

  // users
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT NOT NULL UNIQUE,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      display_name  TEXT UNIQUE,
      avatar_url    TEXT,
      is_online     INTEGER NOT NULL DEFAULT 0,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at    DATETIME DEFAULT NULL
    );
  `)

  // friends
  db.exec(`
    CREATE TABLE IF NOT EXISTS friends (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id INTEGER NOT NULL,
      addressee_id INTEGER NOT NULL,
      status       TEXT NOT NULL DEFAULT 'pending'
                   CHECK(status IN ('pending', 'accepted', 'blocked')),
      created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (addressee_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE (requester_id, addressee_id)
    );
  `)
  
  //tournaments
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'finished')),
      winner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (winner_id) REFERENCES users(id)
    );
  `)

  // liaison tournois joueurs
  db.exec(`
    CREATE TABLE IF NOT EXISTS tournament_players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE (tournament_id, user_id)
    );
  `)

  // matchs
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tournament_id INTEGER,
      round INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'finished')),
      mode TEXT DEFAULT '1v1' CHECK(mode IN ('1v1', '2v2', '3p', '4p', 'ai')),
      winner_id INTEGER,
      ai_score INTEGER,
      started_at DATETIME,
      finished_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (winner_id) REFERENCES users(id)
    );
  `)

  // liaisons matchs et joueur qui participent au match
  db.exec(`
    CREATE TABLE IF NOT EXISTS match_player (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      score INTEGER,
      FOREIGN KEY (match_id) REFERENCES matches(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE (match_id, user_id)
    );
  `)



}

export default initTables