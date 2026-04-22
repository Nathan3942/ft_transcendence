import Database from 'better-sqlite3'
import { config } from '../config/env'
import { existsSync, mkdirSync } from 'fs'//filesystem
import { dirname } from 'path' //path natif node.js


let db: Database.Database | null = null

export const initDatabase = (): Database.Database => {
  if (db) {
    return db
  }
    const folder = dirname(config.database.path)
  if (!existsSync(folder)){
    mkdirSync(folder, { recursive: true })
  }
    db = new Database(config.database.path)
    db.pragma('foreign_keys = ON') //liaisons tables db
    db.pragma("journal_mode = WAL") //lecture pendant ecriture ok
    return db
}

export const getDatabase = (): Database.Database => {
  if (!db) {
    return initDatabase()
  }
  return db
}

export const checkDatabaseHealth = (): boolean => {

  const dbtemp = getDatabase();
  
  try {
    const raw = dbtemp.pragma("integrity_check");
    console.log(raw);

  const value = raw as {integrity_check: string}[]
  if (value.length <= 0)
      return false;
  if (value[0].integrity_check !== "ok")
    return false;
} catch(err){
  if(err instanceof Error)
    console.log(err.message)
  else
    console.log("Unknown error during DB health check", err);
  return false;
}
  return true;
}
