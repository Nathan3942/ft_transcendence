import Database from 'better-sqlite3' //importe fonctions et classe du package
import { config } from '../config/env'
import { existsSync, mkdirSync } from 'fs'//fs = filesystem natif node.js
import { dirname } from 'path' //path natif node.js

//variable mutable / 1 seule connexion reutilisable singleton
let db: Database.Database | null = null

export const initDatabase = (): Database.Database => {
  if (db) {
    return db
  }
    //creer un dossier pour la db
    const folder = dirname(config.database.path)
  if (!existsSync(folder)){ //check si dossier existe deja
    mkdirSync(folder, { recursive: true })
  }
    db = new Database(config.database.path) //constructeur
    db.pragma('foreign_keys = ON') //bloque les insertion de fausse data liasons des tables db
    db.pragma("journal_mode = WAL") //permet plusieurs requetes db simultanées les ecritures db vont dans fichier temp .wal ensuite fusion
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
