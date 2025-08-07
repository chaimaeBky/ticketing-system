from flask import Flask, request, jsonify
import psycopg2
import bcrypt
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
import logging
from werkzeug.utils import secure_filename
from flask import send_from_directory


app = Flask(__name__)
CORS(app) 
# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Une seule fonction avec configuration centralisée
DB_CONFIG = {
    'host': 'localhost',
    'database': 'postgres',
    'user': 'postgres',
    'password': 'ROOT'
}

def get_db_connection():
    """Fonction unique pour toute l'application"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        logger.error(f"Erreur de connexion: {e}")
        return None
def connect_db():
    """Fonction de compatibilité pour l'ancien code"""
    return get_db_connection()



@app.route('/', methods=['POST'])
def login():
    data = request.json 
    email = data.get('email')
    password = data.get('password')

    try:
        con = connect_db()
        cur = con.cursor()
        
        cur.execute("SELECT * FROM utilisateur WHERE email = %s", (email,))
        user = cur.fetchone()

        cur.close()
        con.close()

        if user:
            mot_de_passe_hash = user[3] 
            if bcrypt.checkpw(password.encode('utf-8'), mot_de_passe_hash.encode('utf-8')):
                return jsonify({
                    "message": "login successful",
                    "user": {
                        "id": user[0],
                        "nom": user[1],
                        "email": user[2],
                        "role": user[4]
                    }
                })
            else:
                return jsonify({"error": "Mot de passe incorrect"}), 401
        else:
            return jsonify({"error": "Utilisateur non trouvé"}), 401

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/register', methods=['POST'])
def register():
    data = request.json
    newUser = data.get('newUser')
    mot_de_passe_en_clair = newUser.get('mot_de_passe')
    mot_de_passe_hash = bcrypt.hashpw(mot_de_passe_en_clair.encode('utf-8'), bcrypt.gensalt())

    try:
        con = connect_db()
        cur = con.cursor()


        cur.execute("SELECT id FROM utilisateur WHERE email = %s", (newUser.get('email'),))
        existing_user = cur.fetchone()
        if existing_user:
            cur.close()
            con.close()
            return jsonify({"error": "Cet email est déjà utilisé."}), 409  # 409 Conflict
        

        cur.execute("""
            INSERT INTO utilisateur (id, nom, email, mot_de_passe, role)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            newUser.get('id'),
            newUser.get('nom'),
            newUser.get('email'),
            mot_de_passe_hash.decode('utf-8'),
            newUser.get('role')
        ))

        con.commit()
        cur.close()

        cur2 = con.cursor()
        cur2.execute("SELECT * FROM utilisateur WHERE id = %s", (newUser.get('id'),))
        user = cur2.fetchone()
        cur2.close()
        con.close()

        if user:
            return jsonify({"message": "Utilisateur enregistré avec succès"})
        else:
            return jsonify({"message": "Échec de l'enregistrement"}), 401

    except Exception as e:
        print("Erreur :", e)  
        return jsonify({"error": str(e)}), 500
##################################
#####################################"
#--------------DashboardClientAPI--------------#######





def format_ticket_data(ticket_row):
    """Formate les données du ticket pour l'API"""
    return {
        'id': ticket_row['id'],
        'sujet': ticket_row['sujet'],
        'description': ticket_row['description'],
        'type': ticket_row['type'],
        'etat': ticket_row['etat'],
        'date_creation': ticket_row['date_creation'].isoformat() if ticket_row['date_creation'] else None,
        'date_resolution': ticket_row['date_resolution'].isoformat() if ticket_row['date_resolution'] else None,
        'client_id': str(ticket_row['client_id']),
        'technicien_id': str(ticket_row['technicien_id']) if ticket_row['technicien_id'] else None,
        'client_nom': ticket_row.get('client_nom'),
        'client_email': ticket_row.get('client_email'),
        'technicien_nom': ticket_row.get('technicien_nom')
    }

@app.route('/api/tickets', methods=['GET'])
def get_tickets():
    """Récupère tous les tickets avec les informations des utilisateurs"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion à la base de données'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Requête avec jointures pour récupérer les informations des utilisateurs
        query = """
        SELECT 
            t.id,
            t.sujet,
            t.description,
            t.type,
            t.etat,
            t.date_creation,
            t.date_resolution,
            t.client_id,
            t.technicien_id,
            c.nom as client_nom,
            c.email as client_email,
            tech.nom as technicien_nom
        FROM ticket t
        LEFT JOIN utilisateur c ON t.client_id = c.id
        LEFT JOIN utilisateur tech ON t.technicien_id = tech.id
        ORDER BY t.date_creation DESC
        """
        
        cursor.execute(query)
        tickets_data = cursor.fetchall()
        
        # Formatage des données
        tickets = [format_ticket_data(ticket) for ticket in tickets_data]
        
        logger.info(f"Récupération de {len(tickets)} tickets")
        
        return jsonify({
            'success': True,
            'tickets': tickets,
            'total': len(tickets)
        })
        
    except psycopg2.Error as e:
        logger.error(f"Erreur lors de la récupération des tickets: {e}")
        return jsonify({'error': 'Erreur lors de la récupération des tickets'}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket_by_id(ticket_id):
    """Récupère un ticket spécifique par son ID"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion à la base de données'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT 
            t.id,
            t.sujet,
            t.description,
            t.type,
            t.etat,
            t.date_creation,
            t.date_resolution,
            t.client_id,
            t.technicien_id,
            c.nom as client_nom,
            c.email as client_email,
            tech.nom as technicien_nom
        FROM ticket t
        LEFT JOIN utilisateur c ON t.client_id = c.id
        LEFT JOIN utilisateur tech ON t.technicien_id = tech.id
        WHERE t.id = %s
        """
        
        cursor.execute(query, (ticket_id,))
        ticket_data = cursor.fetchone()
        
        if not ticket_data:
            return jsonify({'error': 'Ticket non trouvé'}), 404
        
        ticket = format_ticket_data(ticket_data)
        
        return jsonify({
            'success': True,
            'ticket': ticket
        })
        
    except psycopg2.Error as e:
        logger.error(f"Erreur lors de la récupération du ticket {ticket_id}: {e}")
        return jsonify({'error': 'Erreur lors de la récupération du ticket'}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tickets/client/<client_id>', methods=['GET'])
def get_tickets_by_client(client_id):
    """Récupère les tickets d'un client spécifique"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion à la base de données'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query = """
        SELECT 
            t.id,
            t.sujet,
            t.description,
            t.type,
            t.etat,
            t.date_creation,
            t.date_resolution,
            t.client_id,
            t.technicien_id,
            c.nom as client_nom,
            c.email as client_email,
            tech.nom as technicien_nom
        FROM ticket t
        LEFT JOIN utilisateur c ON t.client_id = c.id
        LEFT JOIN utilisateur tech ON t.technicien_id = tech.id
        WHERE t.client_id = %s
        ORDER BY t.date_creation DESC
        """
        
        cursor.execute(query, (client_id,))
        tickets_data = cursor.fetchall()
        
        tickets = [format_ticket_data(ticket) for ticket in tickets_data]
        
        return jsonify({
            'success': True,
            'tickets': tickets,
            'total': len(tickets)
        })
        
    except psycopg2.Error as e:
        logger.error(f"Erreur lors de la récupération des tickets du client {client_id}: {e}")
        return jsonify({'error': 'Erreur lors de la récupération des tickets'}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/tickets/stats', methods=['GET'])
def get_tickets_stats():
    """Récupère les statistiques des tickets"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erreur de connexion à la base de données'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Statistiques par état
        query_stats = """
        SELECT 
            etat,
            COUNT(*) as count
        FROM ticket
        GROUP BY etat
        """
        
        cursor.execute(query_stats)
        stats_data = cursor.fetchall()
        
        # Statistiques par sujet
        query_subjects = """
        SELECT 
            sujet,
            COUNT(*) as count
        FROM ticket
        GROUP BY sujet
        """
        
        cursor.execute(query_subjects)
        subjects_data = cursor.fetchall()
        
        # Total des tickets
        cursor.execute("SELECT COUNT(*) as total FROM ticket")
        total_tickets = cursor.fetchone()['total']
        
        return jsonify({
            'success': True,
            'stats': {
                'total': total_tickets,
                'by_status': {row['etat']: row['count'] for row in stats_data},
                'by_subject': {row['sujet']: row['count'] for row in subjects_data}
            }
        })
        
    except psycopg2.Error as e:
        logger.error(f"Erreur lors de la récupération des statistiques: {e}")
        return jsonify({'error': 'Erreur lors de la récupération des statistiques'}), 500
    
    finally:
        cursor.close()
        conn.close()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Point de contrôle de santé de l'API"""
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'timestamp': datetime.now().isoformat()
        })
    else:
        return jsonify({
            'status': 'unhealthy',
            'database': 'disconnected',
            'timestamp': datetime.now().isoformat()
        }), 500

##################################
#####################################"
#--------------END_DashboardClientAPI--------------#######


##################################
#####################################"
#--------------CreationeTichetAPI--------------#######
@app.route('/api/tickets', methods=['POST'])
def create_ticket():
    """Crée un nouveau ticket"""
    logger.info("Début de la création d'un nouveau ticket")
    
    conn = get_db_connection()
    if not conn:
        logger.error("Impossible de se connecter à la base de données")
        return jsonify({'error': 'Erreur de connexion à la base de données'}), 500
    
    cursor = None
    try:
        # Log des données reçues
        logger.info(f"Données du formulaire reçues: {dict(request.form)}")
        logger.info(f"Fichiers reçus: {list(request.files.keys())}")
        
        # Récupération des données du formulaire
        sujet = request.form.get('sujet')
        type_ticket = request.form.get('type')
        description = request.form.get('description')
        
        logger.info(f"Données extraites - Sujet: {sujet}, Type: {type_ticket}, Description: {description[:50]}...")
        
        # Validation des champs obligatoires
        if not sujet or not type_ticket or not description:
            logger.warning("Champs obligatoires manquants")
            return jsonify({'error': 'Tous les champs obligatoires doivent être remplis'}), 400
        
        # Validation que le sujet est dans les valeurs autorisées (selon votre ENUM)
        sujet_autorises = ['livraison', 'paiement', 'bug', 'retour', 'autre']
        if sujet not in sujet_autorises:
            logger.warning(f"Sujet non autorisé: {sujet}")
            return jsonify({'error': 'Sujet non autorisé'}), 400
        
        # Validation que le type est dans les valeurs autorisées
        types_autorises = [
            'probleme_livraison', 'incident_transport', 'conteneur', 
            'stockage', 'facturation_paiement', 'reclamation_client', 
            'probleme_technique'
        ]
        if type_ticket not in types_autorises:
            logger.warning(f"Type non autorisé: {type_ticket}")
            return jsonify({'error': 'Type non autorisé'}), 400
        
        logger.info("Début de l'insertion en base de données")
        cursor = conn.cursor()
        
        # Récupération d'un client UUID existant (premier client trouvé)
        # À remplacer plus tard par l'UUID de l'utilisateur connecté
        cursor.execute("SELECT id FROM utilisateur WHERE role = 'client' LIMIT 1")
        client_result = cursor.fetchone()
        
        if not client_result:
            logger.error("Aucun client trouvé dans la base de données")
            return jsonify({'error': 'Aucun client disponible'}), 400
        
        client_id = client_result[0]
        logger.info(f"Utilisation du client_id: {client_id}")
        
        # Insertion du ticket dans la base de données
        # Note: L'état par défaut 'FERME' selon votre ENUM (en majuscules)
        insert_query = """
        INSERT INTO ticket (sujet, description, type, etat, date_creation, client_id)
        VALUES (%s, %s, %s, 'FERME', NOW(), %s)
        RETURNING id, date_creation
        """
        
        logger.info("Exécution de la requête d'insertion")
        cursor.execute(insert_query, (sujet, description, type_ticket, client_id))
        
        # Récupération de l'ID du ticket créé
        new_ticket = cursor.fetchone()
        if not new_ticket:
            logger.error("Échec de l'insertion du ticket")
            return jsonify({'error': 'Échec de la création du ticket'}), 500
            
        ticket_id = new_ticket[0]
        date_creation = new_ticket[1]
        
        logger.info(f"Ticket inséré avec l'ID: {ticket_id}")
        
        # Gestion des pièces jointes
        pieces_jointes = request.files.getlist('pieces_jointes')
        if pieces_jointes and pieces_jointes[0].filename:
            logger.info(f"Traitement de {len(pieces_jointes)} pièce(s) jointe(s) pour le ticket {ticket_id}")
            
            # Créer un dossier pour les fichiers si nécessaire
            upload_folder = f"uploads/tickets/{ticket_id}"
            os.makedirs(upload_folder, exist_ok=True)
            
            for file in pieces_jointes:
                if file.filename:
                    # Sécuriser le nom du fichier
                    filename = secure_filename(file.filename)
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"{timestamp}_{filename}"
                    
                    # Chemin complet du fichier
                    file_path = os.path.join(upload_folder, filename)
                    
                    try:
                        # Sauvegarder le fichier
                        file.save(file_path)
                        
                        # Enregistrer en base de données
                        cursor.execute("""
                            INSERT INTO piece_jointe (nom, chemin, ticket_id)
                            VALUES (%s, %s, %s)
                        """, (file.filename, file_path, ticket_id))
                        
                        logger.info(f"Fichier sauvegardé: {file_path}")
                        
                    except Exception as e:
                        logger.error(f"Erreur lors de la sauvegarde du fichier {filename}: {e}")
                        # Continue avec les autres fichiers même si un échoue
        
        # Validation de l'insertion
        conn.commit()
        logger.info(f"Ticket créé avec succès - ID: {ticket_id}, Client: {client_id}")
        
        return jsonify({
            'success': True,
            'message': 'Ticket créé avec succès',
            'ticket': {
                'id': ticket_id,
                'sujet': sujet,
                'type': type_ticket,
                'description': description,
                'etat': 'OUVERT',
                'date_creation': date_creation.isoformat() if date_creation else None,
                'client_id': str(client_id)
            }
        }), 201
        
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Erreur PostgreSQL lors de la création du ticket: {e}")
        logger.error(f"Code d'erreur: {e.pgcode}")
        return jsonify({'error': f'Erreur de base de données: {str(e)}'}), 500
    
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Erreur inattendue lors de la création du ticket: {e}")
        logger.error(f"Type d'erreur: {type(e).__name__}")
        return jsonify({'error': f'Erreur inattendue: {str(e)}'}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        logger.info("Fin du traitement de création de ticket")

##################################
#####################################"
#--------------EndCreationeTichetAPI--------------#######

# #-------importerLesPieceJoint--------------#

# # ========== NOUVELLES ROUTES POUR LES PIECES JOINTES ==========

# Endpoint pour l'upload de pièces jointes
@app.route('/api/tickets/<int:ticket_id>/attachments', methods=['POST'])
def upload_attachment(ticket_id):
    if 'file' not in request.files:
        return jsonify({'error': 'Aucun fichier fourni'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'Nom de fichier vide'}), 400

    try:
        # Vérifier que le ticket existe
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id FROM ticket WHERE id = %s", (ticket_id,))
        if not cur.fetchone():
            return jsonify({'error': 'Ticket non trouvé'}), 404

        # Créer le dossier d'upload s'il n'existe pas
        upload_folder = f"uploads/tickets/{ticket_id}"
        os.makedirs(upload_folder, exist_ok=True)

        # Sécuriser le nom du fichier
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_folder, unique_filename)

        # Sauvegarder le fichier
        file.save(file_path)

        # Enregistrer en BDD
        cur.execute("""
            INSERT INTO piece_jointe (nom, chemin, ticket_id)
            VALUES (%s, %s, %s)
            RETURNING id, nom
        """, (filename, file_path, ticket_id))
        
        attachment = cur.fetchone()
        conn.commit()

        return jsonify({
            'success': True,
            'attachment': {
                'id': attachment[0],
                'nom': attachment[1]
            }
        }), 201

    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()
# Ajoutez cet endpoint à votre app.py
@app.route('/api/tickets/<int:ticket_id>/attachments', methods=['GET'])
def get_ticket_attachments(ticket_id):
    conn = None
    cur = None
    try:
        # Validation de l'ID
        if not isinstance(ticket_id, int) or ticket_id <= 0:
            return jsonify({"error": "ID de ticket invalide"}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({"error": "Échec de connexion à la base"}), 500

        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Requête avec vérification d'existence du ticket
        cur.execute("""
            SELECT pj.id, pj.nom, pj.chemin, pj.taille
            FROM piece_jointe pj
            INNER JOIN ticket t ON pj.ticket_id = t.id
            WHERE t.id = %s
            ORDER BY pj.date_upload DESC
        """, (ticket_id,))
        
        pieces = cur.fetchall()
        
        # Validation des chemins
        base_dir = os.path.abspath("uploads")
        attachments = []
        for piece in pieces:
            if not os.path.exists(piece["chemin"]):
                logger.warning(f"Fichier introuvable: {piece['chemin']}")
                continue
                
            attachments.append({
                "id": piece["id"],
                "nom": piece["nom"],
                "taille": piece["taille"]
            })

        return jsonify({
            "success": True,
            "attachments": attachments,
            "count": len(attachments)
        })

    except Exception as e:
        logger.error(f"Erreur critique: {str(e)}", exc_info=True)
        return jsonify({"error": "Erreur interne"}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()
# Endpoint pour récupérer les pièces jointes d'un ticket
@app.route('/api/tickets/<int:ticket_id>/attachments/<int:attachment_id>', methods=['GET'])
def download_attachment(ticket_id, attachment_id):
    conn = None
    cur = None
    
    try:
        # Validation des IDs
        if ticket_id <= 0 or attachment_id <= 0:
            return jsonify({'error': 'IDs invalides'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Database connection failed'}), 500
            
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Requête sécurisée avec jointure
        cur.execute("""
            SELECT pj.chemin, pj.nom 
            FROM piece_jointe pj
            INNER JOIN ticket t ON pj.ticket_id = t.id
            WHERE pj.id = %s AND pj.ticket_id = %s
        """, (attachment_id, ticket_id))
        
        attachment = cur.fetchone()
        if not attachment:
            return jsonify({'error': 'Pièce jointe non trouvée'}), 404
        
        # Chemin sécurisé
        base_path = os.path.abspath('uploads')
        file_path = os.path.abspath(attachment['chemin'])
        
        # Validation de sécurité
        if not file_path.startswith(base_path):
            return jsonify({'error': 'Chemin non autorisé'}), 403
            
        if not os.path.exists(file_path):
            return jsonify({'error': 'Fichier introuvable'}), 404
            
        return send_from_directory(
            directory=os.path.dirname(file_path),
            path=os.path.basename(file_path),
            as_attachment=True,
            download_name=secure_filename(attachment['nom'])
        )
        
    except Exception as e:
        logger.error(f"Erreur téléchargement PJ {attachment_id}: {str(e)}")
        return jsonify({'error': 'Erreur de traitement'}), 500
    finally:
        if cur: cur.close()
        if conn: conn.close()
# Code de debug à ajouter temporairement
@app.route('/debug/routes')
def list_routes():
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'rule': str(rule)
        })
    return jsonify(routes)
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)