/* ce fichier permet de determiner les elements que doit contenir
un user dans mon systeme, on cree en quelque sorte un type user
contrat de forme
*/

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online: number; // 0 | 1 (SQLite n'a pas de BOOLEAN)
  created_at: string;
  deleted_at: string | null;
}

// Version sans password_hash pour les réponses API
export interface PublicUser {
  id: number;
  username: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  is_online: number;
  created_at: string;
}