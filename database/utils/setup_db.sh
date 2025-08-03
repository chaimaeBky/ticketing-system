#!/bin/bash

# Configuration de la base de données pour le système de ticketing
# Usage: ./setup_db.sh [environment]

ENVIRONMENT=${1:-development}
DB_NAME="ticketing_system_${ENVIRONMENT}"

echo "🚀 Configuration de la base de données pour l'environnement: $ENVIRONMENT"

# Création de la base de données
echo "📝 Création de la base de données..."
createdb $DB_NAME

# Exécution de la migration initiale
echo "🔧 Application du schéma initial..."
psql $DB_NAME -f ../migrations/001_initial_schema.sql

# Insertion des données de test (seulement en dev)
if [ "$ENVIRONMENT" = "development" ]; then
    echo "📊 Insertion des données de développement..."
    psql $DB_NAME -f ../seeds/dev_data.sql
fi

echo "✅ Configuration terminée ! Base de données '$DB_NAME' prête à utiliser"
echo "🔗 Connexion: psql $DB_NAME"