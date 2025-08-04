from flask import Flask, request, jsonify
import psycopg2
import bcrypt
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
import os
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app) 

def connect_db():
    return psycopg2.connect(
        host="localhost",
        database="TicketingSystemDB",
        user="postgres",
        password="ROOT"
    )

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

# Configuration de la base de données pour la partie DashboardClient
DB_CONFIG = {
    'host': 'localhost',
    'database': 'postgres',  # Changez par TicketingSystemDB si vous créez cette base
    'user': 'postgres',
    'password': 'ROOT'
}

# Configuration des logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_db_connection():
    """Établit une connexion à la base de données PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except psycopg2.Error as e:
        logger.error(f"Erreur de connexion à la base de données: {e}")
        return None

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
if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)