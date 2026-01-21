/* ce fichier permet de creer les table dans la database

*/
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
  db.exec('CREATE TABLE IF NOT EXIST tournament()')


  
}

export default initTables
