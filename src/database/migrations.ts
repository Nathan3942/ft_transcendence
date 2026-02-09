/**
 * Database migrations
 * Handles schema updates for existing databases
 */

import { getDatabase } from './connection'

/**
 * Migration: Add new columns to matches table
 * - tournament_id: make nullable
 * - round: make nullable
 * - status: add with CHECK constraint
 * - winner_id: add as FK to users
 * - started_at: add as datetime
 * - finished_at: add as datetime
 */
export function migrateMatchesTable(): void {
  const db = getDatabase()

  try {
    // Check if migration is needed by looking for the 'status' column
    const tableInfo = db.prepare("PRAGMA table_info(matches)").all() as Array<{
      cid: number
      name: string
      type: string
      notnull: number
      dflt_value: any
      pk: number
    }>

    const hasStatusColumn = tableInfo.some(col => col.name === 'status')

    if (hasStatusColumn) {
      console.log('✅ Matches table already migrated')
      return
    }

    console.log('🔄 Migrating matches table...')

    // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
    db.exec('BEGIN TRANSACTION')

    // Temporarily disable foreign key constraints
    db.exec('PRAGMA foreign_keys = OFF')

    // Save match_player data
    db.exec(`
      CREATE TABLE match_player_backup AS
      SELECT * FROM match_player
    `)

    // Drop match_player (depends on matches)
    db.exec('DROP TABLE match_player')

    // Create new matches table with updated schema
    db.exec(`
      CREATE TABLE matches_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER,
        round INTEGER,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'finished')),
        winner_id INTEGER,
        started_at DATETIME,
        finished_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
        FOREIGN KEY (winner_id) REFERENCES users(id)
      )
    `)

    // Copy data from old matches table to new table
    // Set default status to 'pending' for existing matches
    db.exec(`
      INSERT INTO matches_new (id, tournament_id, round, status, created_at)
      SELECT id, tournament_id, round, 'pending', created_at
      FROM matches
    `)

    // Drop old matches table
    db.exec('DROP TABLE matches')

    // Rename new table
    db.exec('ALTER TABLE matches_new RENAME TO matches')

    // Recreate match_player table
    db.exec(`
      CREATE TABLE match_player (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        score INTEGER,
        FOREIGN KEY (match_id) REFERENCES matches(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE (match_id, user_id)
      )
    `)

    // Restore match_player data
    db.exec(`
      INSERT INTO match_player (id, match_id, user_id, score)
      SELECT id, match_id, user_id, score
      FROM match_player_backup
    `)

    // Drop backup table
    db.exec('DROP TABLE match_player_backup')

    // Re-enable foreign key constraints
    db.exec('PRAGMA foreign_keys = ON')

    db.exec('COMMIT')

    console.log('✅ Matches table migrated successfully')
  } catch (error) {
    // Re-enable foreign key constraints even on error
    db.exec('PRAGMA foreign_keys = ON')
    db.exec('ROLLBACK')
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Run all pending migrations
 */
export function runMigrations(): void {
  console.log('🔄 Running database migrations...')
  migrateMatchesTable()
  console.log('✅ All migrations completed')
}
