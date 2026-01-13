import { initDatabase, getDatabase, checkDatabaseHealth } from './connection'
import { initTables } from './init'

export { initDatabase, getDatabase, checkDatabaseHealth, initTables }

export default { // contains all db functions but unlikely to use
  initDatabase,
  getDatabase,
  checkDatabaseHealth,
  initTables,
}
