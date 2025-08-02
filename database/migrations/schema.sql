-- Schéma v1.0 - [01/08/2025]
-- Auteurs : SAIDA & CHAIMAE
-- ================================
-- SCHÉMA POSTGRESQL - SYSTÈME DE TICKETING
-- ================================

-- Suppression des tables existantes (optionnel)
DROP TABLE IF EXISTS piece_jointe CASCADE;
DROP TABLE IF EXISTS ticket CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;
DROP TYPE IF EXISTS etat_ticket CASCADE;
DROP TYPE IF EXISTS role_utilisateur CASCADE;

-- ================================
-- EXTENSION POUR UUID
-- ================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================
-- TYPES ENUM
-- ================================
CREATE TYPE etat_ticket AS ENUM (
    'OUVERT',
    'EN_COURS', 
    'RESOLU',
    'FERME'
);

CREATE TYPE role_utilisateur AS ENUM (
    'client',
    'technicien', 
    'admin'
);

-- ================================
-- TABLE UTILISATEUR
-- ================================
CREATE TABLE utilisateur (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL, -- Hash du mot de passe
    role role_utilisateur NOT NULL DEFAULT 'client'
);

-- Index pour améliorer les performances
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_utilisateur_role ON utilisateur(role);

-- ================================
-- TABLE TICKET
-- ================================
CREATE TABLE ticket (
    id SERIAL PRIMARY KEY,
    sujet VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- Ex: 'bug', 'demande', 'incident'
    etat etat_ticket NOT NULL DEFAULT 'FERME',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_resolution TIMESTAMP NULL,

    -- Relations
    client_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
    technicien_id UUID NULL REFERENCES utilisateur(id) ON DELETE SET NULL,

    -- Contraintes
    CONSTRAINT chk_dates CHECK (date_resolution IS NULL OR date_resolution >= date_creation)
);

-- Index pour améliorer les performances
CREATE INDEX idx_ticket_client ON ticket(client_id);
CREATE INDEX idx_ticket_technicien ON ticket(technicien_id);
CREATE INDEX idx_ticket_etat ON ticket(etat);
CREATE INDEX idx_ticket_date_creation ON ticket(date_creation);

-- ================================
-- TABLE PIECE_JOINTE
-- ================================
CREATE TABLE piece_jointe (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    chemin VARCHAR(500) NOT NULL, -- Chemin vers le fichier

    -- Relation
    ticket_id INTEGER NOT NULL REFERENCES ticket(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX idx_piece_jointe_ticket ON piece_jointe(ticket_id);
