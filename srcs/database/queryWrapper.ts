/*centraliser les requetes sql */

import {getDatabase} from "./connection"

export function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  const db = getDatabase();
  return db.prepare(sql).get(...params) as T | undefined; // execute la ligne
}

export function queryAll<T>(sql: string, params: unknown[] = []): T[] {
  const db = getDatabase();
  return db.prepare(sql).all(...params) as T[]; // all pour toutes les lignes
}

export function queryExecute(sql: string, params: unknown[] = []) {
  const db = getDatabase();
  return db.prepare(sql).run(...params);
}
