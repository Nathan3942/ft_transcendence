# transcendence-backend-collab

broton and tmontani's work on the backend of the ft_transcendance project

our approach is to start with a minimal and fonctional backend and to add features along the way.

 - Objectif
- Architecture
- Concepts clés
- Choix techniques
- Pièges
- Ce que j’ai appris

# Transcendence – Backend

## 1. Objectif du projet
- Ce que fait le backend
- À quoi il sert dans le projet global
- Problèmes principaux qu’il résout

---

## 2. Périmètre et responsabilités
- Ce que le backend GÈRE
- Ce qu’il ne gère PAS
- Hypothèses / contraintes du projet

---

## 3. Architecture globale
### 3.1 Vue d’ensemble
- Organisation générale des dossiers
- Séparation des responsabilités

### 3.2 Flux principal
Exemple :
Request → Middleware → Controller → Service → Database → Response

---

## 4. Organisation du code
- controllers/ → rôle
- services/ → rôle
- middlewares/ → rôle
- models/ → rôle
- utils/ → rôle

👉 Pourquoi cette organisation ?

---

## 5. Concepts clés
### 5.1 Authentification
- Problème à résoudre
- Principe général
- Où c’est implémenté dans le projet

### 5.2 Autorisation
- Différence avec l’auth
- Cas concrets dans le projet

### 5.3 Temps réel / WebSocket (si applicable)
- Pourquoi c’est nécessaire
- Contraintes associées

*(1 concept = 1 sous-section)*

---

## 6. Décisions techniques importantes
### 6.1 Pourquoi ce framework / langage
### 6.2 Pourquoi cette architecture
### 6.3 Pourquoi ce pattern (middleware, service, etc.)

👉 Toujours répondre à : **pourquoi ?**

---

## 7. Sécurité
- Points de sécurité mis en place
- Ce qui est volontairement simple
- Ce qui pourrait être amélioré

---

## 8. Gestion des erreurs
- Où sont gérées les erreurs
- Philosophie (centralisée ou non)
- Erreurs fréquentes anticipées

---

## 9. Tests
- Ce qui est testé
- Ce qui ne l’est pas (et pourquoi)
- Type de tests (manuel, automatisé)

---

## 10. Pièges et erreurs rencontrées
- Erreurs de conception
- Mauvaises implémentations initiales
- Bugs importants et leur cause

---

## 11. Ce que j’ai appris
- Leçons techniques
- Leçons méthodologiques
- Ce que je ferais différemment

---

## 12. Limitations actuelles
- Ce qui manque
- Ce qui est volontairement simplifié
- Hypothèses non couvertes

---

## 13. Améliorations possibles
- À court terme
- À long terme
- Hors scope du projet

---

## 14. À approfondir plus tard
- Concepts avancés
- Optimisations
- Sujets à revoir après le projet

---

## 15. Glossaire (optionnel mais très fort)
- JWT :
- Middleware :
- Service :
- Controller :

---

## 16. Questions de soutenance possibles (OPTIONNEL MAIS EXCELLENT)
- Pourquoi avoir mis cette logique ici ?
- Que se passe-t-il si X échoue ?
- Comment sécuriser davantage cette partie ?
