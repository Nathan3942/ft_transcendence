

import { initDatabase, getDatabase, checkDatabaseHealth } from './connection'
import { initTables } from './init'
import { runMigrations } from './migrations'

export { initDatabase, getDatabase, checkDatabaseHealth, initTables, runMigrations }

export default { // contains all db functions but unlikely to use
  initDatabase,
  getDatabase,
  checkDatabaseHealth,
  initTables,
  runMigrations,
}
