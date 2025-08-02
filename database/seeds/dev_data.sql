-- ================================
-- DONNÉES DE TEST (OPTIONNEL)
-- ================================

-- Insertion d'utilisateurs de test
INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES
    ('Admin Système', 'admin@ticketing.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU2JRSwYKsL9T3K6', 'admin'),
    ('Jean Dupont', 'jean.dupont@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU2JRSwYKsL9T3K6', 'client'),
    ('Marie Martin', 'marie.martin@email.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU2JRSwYKsL9T3K6', 'client'),
    ('Pierre Tech', 'pierre.tech@ticketing.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU2JRSwYKsL9T3K6', 'technicien'),
    ('Sophie Tech', 'sophie.tech@ticketing.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeU2JRSwYKsL9T3K6', 'technicien');

-- Insertion de tickets de test
INSERT INTO ticket (sujet, description, type, client_id, technicien_id, etat) VALUES
    ('Problème de connexion', 'Je n''arrive pas à me connecter à l''application', 'incident', 2, 4, 'EN_COURS'),
    ('Demande de nouvelle fonctionnalité', 'Pouvoir exporter les données en PDF', 'demande', 3, NULL, 'OUVERT'),
    ('Bug sur la page d''accueil', 'Le bouton de navigation ne fonctionne pas', 'bug', 2, 5, 'RESOLU'),
    ('Lenteur de l''application', 'L''application est très lente depuis hier', 'incident', 3, 4, 'OUVERT');