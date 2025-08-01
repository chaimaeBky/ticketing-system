# Base de données - Système de Ticketing

## Vue d'ensemble
Base de données PostgreSQL pour un système de gestion de tickets avec authentification et gestion des pièces jointes.

## Configuration rapide

### Prérequis
- PostgreSQL 12+
- psql (client PostgreSQL)

### Installation
1. Cloner le projet
2. Copier `.env.example` vers `.env` et configurer
3. Exécuter le script de configuration :
   ```bash
   cd database/utils
   chmod +x setup_db.sh
   ./setup_db.sh development