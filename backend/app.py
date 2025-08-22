from flask import Flask, request, jsonify, send_from_directory , session
import psycopg2
import bcrypt
from flask_cors import CORS
from psycopg2.extras import RealDictCursor
from psycopg2 import errors
import os
from datetime import datetime
import logging
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename
from collections import defaultdict
import logging
import traceback
import textwrap
import os
import json
from datetime import timedelta






app = Flask(__name__)
app.secret_key = os.urandom(24) 
app.permanent_session_lifetime = timedelta(minutes=90)


CORS(app,
     origins=["http://localhost:5173"],  
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization", "Accept"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type", "Authorization"]
)

@app.before_request
def before_request():
    public_routes = ["/register", "/"]  # routes accessibles sans login
    
    # Gestion des requêtes OPTIONS pour CORS
    if request.method == "OPTIONS":
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200

    # Protection des routes
    if request.path not in public_routes and not request.path.startswith("/static/"):
        if 'user_id' not in session:
            response = jsonify({'error': 'Utilisateur non connecté'})
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 401



    
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USE_SSL'] = False
app.config['MAIL_USERNAME'] = 'chaimaebky14@gmail.com'
app.config['MAIL_PASSWORD'] = 'umadeaeizuisjzkf' 
app.config['MAIL_DEFAULT_SENDER'] = 'chaimaebky14@gmail.com'
app.config['MAIL_DEBUG'] = True
app.config['MAIL_SUPPRESS_SEND'] = False

mail = Mail(app)

#partie des email !

def send_assignment_email(technicien_info, ticket_info, ticket_id):
    """
    Fonction pour envoyer l'email d'assignation avec debugging complet
    """
    print("=" * 50)
    print(" DÉBUT DE L'ENVOI D'EMAIL")
    print(f" Ticket ID: {ticket_id}")
    print(f" Technicien: {technicien_info}")
    print(f" Ticket Info: {ticket_info}")
    
    try:
        technicien_nom = technicien_info[0] if technicien_info[0] else "Technicien"
        technicien_email = technicien_info[1]
        
        print(f" Email destinataire: {technicien_email}")
        
        if not technicien_email:
            print(" ERREUR: Email destinataire vide")
            return False
            
        if '@' not in technicien_email:
            print(f" ERREUR: Email invalide: {technicien_email}")
            return False
        
        print(" Validation email OK")
        
        print(f" Configuration Mail:")
        print(f"   Server: {app.config.get('MAIL_SERVER')}")
        print(f"   Port: {app.config.get('MAIL_PORT')}")
        print(f"   Username: {app.config.get('MAIL_USERNAME')}")
        print(f"   TLS: {app.config.get('MAIL_USE_TLS')}")
        
        msg = Message(
        subject=f"Nouvelle assignation : Ticket #{ticket_id} - {ticket_info[0]}",
        recipients=[technicien_email],
        sender=app.config['MAIL_USERNAME']
)



        msg.body = textwrap.dedent(f"""
    Bonjour {technicien_nom},

    Vous avez été assigné au ticket #{ticket_id}.

        Détails du ticket :
        Sujet           :   {ticket_info[0]}
        Description     :   {ticket_info[1]}
        Date            :   {ticket_info[2]}
        Type            :   {ticket_info[3]}
        Client          :   {ticket_info[4]}

    Merci de traiter ce ticket dès que possible.

    Cordialement,
    L'équipe technique de TirsoSupport 
""")

        print(" Message créé")
        print(f" Destinataires: {msg.recipients}")
        print(f" Expéditeur: {msg.sender}")
        print(f" Sujet: {msg.subject}")
        
        print(" Tentative d'envoi...")
        
        with app.app_context():
            mail.send(msg)
            
        print(" EMAIL ENVOYÉ AVEC SUCCÈS!")
        return True
        
    except Exception as e:
        print(f" ERREUR lors de l'envoi:")
        print(f"   Type: {type(e).__name__}")
        print(f"   Message: {str(e)}")
        print(f"   Stack trace:")
        traceback.print_exc()
        return False
    finally:
        print("=" * 50)

    

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)



DB_CONFIG = {
    'host': 'localhost',
    'database': 'TicketingSystemDB',  
    'user': 'postgres',
    'password': 'postgres' 
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
    return psycopg2.connect(
        host="localhost",
        database="TicketingSystemDB",
        user="postgres",
        password="postgres"
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

        if user and bcrypt.checkpw(password.encode('utf-8'), user[3].encode('utf-8')):
            session.permanent = True
            session['user_id'] = user[0]
            session['user_role'] = user[4]  
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
            return jsonify({"error": "Email ou mot de passe incorrect"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/logout', methods=['POST'])
def logout():
    session.clear()  
    return jsonify({"message": "Déconnecté avec succès"})


@app.route("/check-session")
def check_session():
    if "user_id" in session:
        return jsonify({"status": "ok"}), 200
    return jsonify({"error": "non connecté"}), 401


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
            return jsonify({"error": "Cet email est déjà utilisé."}), 409

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
            client_nom = newUser.get('nom')
            client_email = newUser.get('email')
            msg = Message(
                subject="Bienvenue sur TirsoSupport !",
                recipients=[client_email],
                sender=app.config['MAIL_USERNAME']
            )
            msg.body = f"""
Bonjour {client_nom},

Votre compte sur TirsoSupport a été créé avec succès !

Voici vos informations de connexion :
Email : {client_email}
Mot de passe : (celui que vous avez choisi lors de l'inscription)

Merci de votre confiance et bienvenue parmi nous !

Cordialement,
L'équipe TirsoSupport
"""
            with app.app_context():
                mail.send(msg)

            return jsonify({"message": "Utilisateur enregistré avec succès et email envoyé"}), 201
        else:
            return jsonify({"message": "Échec de l'enregistrement"}), 401

    except Exception as e:
        print("Erreur :", e)  
        return jsonify({"error": str(e)}), 500



@app.route('/admin', methods=['GET'])
def admin():
    con = connect_db()
    cur = con.cursor()

    cur.execute('select count(*) from ticket ')
    totalTicket = cur.fetchone()[0] or 0 
    cur.close()

    cur2 = con.cursor()
    cur2.execute('''
       SELECT AVG(EXTRACT(EPOCH FROM (date_resolution - date_creation)))
       FROM ticket
       WHERE date_resolution IS NOT NULL;
    ''')    
    dureeMoyenne = cur2.fetchone()[0] or 0
    cur2.close()

    cur3 = con.cursor()
    cur3.execute('SELECT COUNT(*) FROM ticket')
    totalStati = cur3.fetchone()[0] or 1

    cur3.execute('''
        SELECT etat, COUNT(*) AS count
        FROM ticket
        GROUP BY etat
    ''')
    rows = cur3.fetchall()
    cur3.close()
   
    data = []
    for etat, count in rows:
        percent = round((count / totalStati) * 100, 2)
        data.append({
            "etat": etat,
            "count": count,
            "percentage": percent
        })

    con.close()

    return jsonify({
        "totalTickets": totalTicket,
        "dureeMoyenne": dureeMoyenne,
        "ticketStati": data 
    })

@app.route('/ticketsAdmin', methods=['GET'])
def ticketsAdmin():
    con = connect_db()
    cur = con.cursor()

    cur.execute('''
        SELECT 
            t.id,
            u.nom AS client,
            t.sujet,
            t.type,
            t.etat,
            t.date_creation,
            tech.nom AS technicien
        FROM ticket t
        JOIN utilisateur u ON t.client_id = u.id
        LEFT JOIN utilisateur tech ON t.technicien_id = tech.id
    ''')
    
    rows = cur.fetchall()
    cur.close()
    con.close()

    tickets = []
    for row in rows:
        tickets.append({
            "id": row[0],
            "client": row[1],
            "sujet": row[2],
            "type": row[3],
            "etat": row[4],
            "date_creation": row[5].strftime('%Y-%m-%d %H:%M'),
            "technicien": row[6] or ""
        })

    return jsonify(tickets)

@app.route('/listeTechniciens', methods=['GET'])
def listeTechniciens():
    con = connect_db()
    cur = con.cursor()

    cur.execute("SELECT id, nom, email FROM utilisateur WHERE role = 'technicien'")
    rows = cur.fetchall()

    techniciens = [
        {"id": row[0], "nom": row[1], "email": row[2]}
        for row in rows
    ]

    cur.close()
    con.close()

    return jsonify({"techniciens": techniciens})

@app.route('/assign-technicien', methods=['POST'])
def assign_technicien():
    print("\n DÉBUT ASSIGNATION TECHNICIEN")
    
    data = request.json
    technicien_id = data.get('technicien_id')
    ticket_id = data.get('ticket_id')
    
    print(f" Données reçues:")
    print(f"   Technicien ID: {technicien_id}")
    print(f"   Ticket ID: {ticket_id}")

    if not technicien_id or not ticket_id:
        return jsonify({'error': 'Technicien et ticket requis'}), 400

    con = connect_db()
    cur = con.cursor()
    try:
        print(" Recherche du technicien...")
        cur.execute(
            """
            SELECT nom, email 
            FROM utilisateur 
            WHERE id = %s AND role = 'technicien'
            """,
            (technicien_id,)
        )
        technicien_info = cur.fetchone()
        
        if not technicien_info:
            print(" Technicien introuvable")
            return jsonify({'error': 'Technicien introuvable'}), 404
        
        print(f" Technicien trouvé: {technicien_info}")
        
        # Récupérer les informations du ticket
        print(" Recherche du ticket...")
        cur.execute(
            """
            SELECT t.sujet, t.description, t.date_creation, t.type, u.nom as client_nom
            FROM ticket t
            JOIN utilisateur u ON t.client_id = u.id
            WHERE t.id = %s
            """,
            (ticket_id,)
        )
        ticket_info = cur.fetchone()
        
        if not ticket_info:
            print(" Ticket introuvable")
            return jsonify({'error': 'Ticket introuvable'}), 404
        
        print(f"Ticket trouvé: {ticket_info}")
        
        print(" Mise à jour du ticket...")
        cur.execute(
            """
            UPDATE ticket 
            SET technicien_id = %s, etat = 'OUVERT'
            WHERE id = %s
            """,
            (technicien_id, ticket_id)
        )
        con.commit()
        print(" Ticket mis à jour")
        
        print(" Lancement de l'envoi d'email...")
        email_sent = send_assignment_email(technicien_info, ticket_info, ticket_id)
        
        response_data = {
            'success': True,
            'message': f"Technicien assigné et état mis à 'OUVERT'"
        }
        
        if email_sent:
            response_data['message'] += f" - Email envoyé à {technicien_info[1]}"
            print(" SUCCÈS COMPLET!")
        else:
            response_data['warning'] = "Erreur lors de l'envoi de l'email"
            print(" SUCCÈS PARTIEL (sans email)")
        
        print(f" Réponse: {response_data}")
        return jsonify(response_data), 200
        
    except Exception as e:
        con.rollback()
        print(f" ERREUR GÉNÉRALE: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        con.close()
        print(" FIN ASSIGNATION TECHNICIEN\n")



@app.route('/listeUtilisateurs', methods=['GET'])
def listeUtilisateurs():
    con = connect_db()
    cur = con.cursor()

    cur.execute("SELECT id, nom, email, role FROM utilisateur ")
    rows = cur.fetchall()

    utilisateurs = [
        {"id": row[0], "nom": row[1], "email": row[2], "role": row[3]}
        for row in rows
    ]

    cur.close()
    con.close()

    return jsonify({"utilisateurs": utilisateurs})

@app.route('/supprimerUtilisateur/<id>', methods=['DELETE'])
def supprimer_utilisateur(id):
    con = connect_db()
    cur = con.cursor()
    cur.execute("DELETE FROM utilisateur WHERE id = %s", (id,))
    con.commit()
    cur.close()
    con.close()
    return jsonify({"message": "Utilisateur supprimé"}), 200

@app.route('/utilisateur/<id>', methods=['GET'])
def get_utilisateur(id):
    con = connect_db()
    cur = con.cursor()

    cur.execute("SELECT id, nom, email, mot_de_passe FROM utilisateur WHERE id = %s", (id,))
    row = cur.fetchone()

    cur.close()
    con.close()

    if row:
        return jsonify({
            'id': row[0],
            'nom': row[1],
            'email': row[2],
            'mot_de_passe': row[3]
        })
    else:
        return jsonify({'message': 'Utilisateur non trouvé'}), 404
    

@app.route('/modifierUtilisateur/<id>', methods=['PUT'])
def modifier_utilisateur(id):
    conn = None
    cur = None
    try:
        data = request.get_json()
        if not data:
            response = jsonify({'error': 'Données JSON manquantes'})
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 400
        
        required_fields = ['nom', 'email', 'role']
        for field in required_fields:
            if field not in data or not data[field].strip():
                response = jsonify({'error': f'Le champ {field} est requis'})
                response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
                response.headers.add('Access-Control-Allow-Credentials', 'true')
                return response, 400
        
        conn = connect_db()
        cur = conn.cursor()
        
        cur.execute("""
            UPDATE utilisateur
            SET nom = %s, email = %s, role = %s
            WHERE id = %s
        """, (data['nom'].strip(), data['email'].strip(), data['role'].strip(), id))
        
        conn.commit()

        if cur.rowcount == 0:
            response = jsonify({'error': 'Utilisateur introuvable'})
            response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 404

        response = jsonify({'message': 'Utilisateur modifié avec succès'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    except errors.UniqueViolation as e:
        if conn:
            conn.rollback()
        response = jsonify({'error': 'Cet email est déjà utilisé'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Erreur lors de la modification: {str(e)}")  
        response = jsonify({'error': f'Erreur serveur: {str(e)}'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()



@app.route("/ticketsParMois")
def tickets_par_mois():
    conn = connect_db() 
    cursor = conn.cursor()
    cursor.execute("SELECT date_creation FROM ticket")  
    rows = cursor.fetchall()
    conn.close()

    mois_count = defaultdict(int)
    for row in rows:
        date_str = row[0]
        try:
            date_obj = date_str  
            mois = date_obj.strftime("%B %Y")  
            mois_count[mois] += 1
        except Exception as e:
            print(f"Erreur conversion date: {e}")
            continue

    sorted_data = sorted(mois_count.items(), key=lambda x: datetime.strptime(x[0], "%B %Y"))

    return jsonify({"ticketsParMois": [{"mois": k, "nombre": v} for k, v in sorted_data]})

@app.route('/technicians/performance', methods=['GET'])
def technician_performance():
    con = connect_db()
    cur = con.cursor()

    try:
        cur.execute("""
            SELECT 
                u.id,
                u.nom,
                COUNT(t.id) AS resolved_tickets,
                AVG(EXTRACT(EPOCH FROM (t.date_resolution - t.date_creation))) AS avg_resolution_seconds
            FROM utilisateur u
            JOIN ticket t ON u.id = t.technicien_id
            WHERE t.etat = 'RESOLU' AND t.date_resolution IS NOT NULL
            GROUP BY u.id, u.nom
        """)
        rows = cur.fetchall()

        results = []
        for row in rows:
            id, nom, resolved_tickets, avg_seconds = row
            avg_hours = round(avg_seconds / 3600, 2) if avg_seconds else 0
            results.append({
                "id": id,
                "nom": nom,
                "resolved_tickets": resolved_tickets,
                "avg_resolution_hours": avg_hours
            })

        results.sort(key=lambda x: x['avg_resolution_hours'])

        return jsonify(results)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        con.close()


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
        
        query_stats = """
        SELECT 
            etat,
            COUNT(*) as count
        FROM ticket
        GROUP BY etat
        """
        
        cursor.execute(query_stats)
        stats_data = cursor.fetchall()
        
        query_subjects = """
        SELECT 
            sujet,
            COUNT(*) as count
        FROM ticket
        GROUP BY sujet
        """
        
        cursor.execute(query_subjects)
        subjects_data = cursor.fetchall()
        
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
        logger.info(f"Données du formulaire reçues: {dict(request.form)}")
        logger.info(f"Fichiers reçus: {list(request.files.keys())}")
        
        sujet = request.form.get('sujet')
        type_ticket = request.form.get('type')
        description = request.form.get('description')
        
        client_id = request.form.get('client_id')
        
        logger.info(f"Données extraites - Sujet: {sujet}, Type: {type_ticket}, Client_ID: {client_id}")
        logger.info(f"Description: {description[:50] if description else 'None'}...")
        
        if not sujet or not type_ticket or not description or not client_id:
            logger.warning("Champs obligatoires manquants")
            return jsonify({'error': 'Tous les champs obligatoires doivent être remplis'}), 400
        
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM utilisateur WHERE id = %s AND role = 'client'", (client_id,))
        client_result = cursor.fetchone()
        
        if not client_result:
            logger.error(f"Client non trouvé avec ID: {client_id}")
            return jsonify({'error': 'Client non trouvé'}), 404
        
        logger.info(f"Client validé: {client_id}")
        
        sujet_autorises = ['livraison', 'paiement', 'bug', 'retour', 'autre']
        if sujet not in sujet_autorises:
            logger.warning(f"Sujet non autorisé: {sujet}")
            return jsonify({'error': 'Sujet non autorisé'}), 400
        
        
        
        logger.info("Début de l'insertion en base de données")
        
        insert_query = """
        INSERT INTO ticket (sujet, description, type, etat, date_creation, client_id)
        VALUES (%s, %s, %s, 'FERME', NOW(), %s)
        RETURNING id, date_creation, etat
        """
        
        logger.info("Exécution de la requête d'insertion")
        cursor.execute(insert_query, (sujet, description, type_ticket, client_id))
        
        new_ticket = cursor.fetchone()
        if not new_ticket:
            logger.error("Échec de l'insertion du ticket")
            return jsonify({'error': 'Échec de la création du ticket'}), 500
            
        ticket_id = new_ticket[0]
        date_creation = new_ticket[1]
        etat = new_ticket[2]
        
        logger.info(f"Ticket inséré avec l'ID: {ticket_id}, État: {etat}")
        
        pieces_jointes = request.files.getlist('pieces_jointes')
        if pieces_jointes and pieces_jointes[0].filename:
            logger.info(f"Traitement de {len(pieces_jointes)} pièce(s) jointe(s) pour le ticket {ticket_id}")
            
            upload_folder = f"uploads/tickets/{ticket_id}"
            os.makedirs(upload_folder, exist_ok=True)
            
            for file in pieces_jointes:
                if file.filename:
                    filename = secure_filename(file.filename)
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = f"{timestamp}_{filename}"
                    
                    file_path = os.path.join(upload_folder, filename)
                    
                    try:
                        file.save(file_path)
                        
                        cursor.execute("""
                            INSERT INTO piece_jointe (nom, chemin, ticket_id)
                            VALUES (%s, %s, %s)
                        """, (file.filename, file_path, ticket_id))
                        
                        logger.info(f"Fichier sauvegardé: {file_path}")
                        
                    except Exception as e:
                        logger.error(f"Erreur lors de la sauvegarde du fichier {filename}: {e}")
        
        conn.commit()
        logger.info(f" Ticket créé avec succès - ID: {ticket_id}, Client: {client_id}, État: {etat}")
        
        cursor.execute("""
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
            c.email as client_email
        FROM ticket t
        LEFT JOIN utilisateur c ON t.client_id = c.id
        WHERE t.id = %s
        """, (ticket_id,))
        
        ticket_complet = cursor.fetchone()
        
        if ticket_complet:
            ticket_data = {
                'id': ticket_complet[0],
                'sujet': ticket_complet[1],
                'description': ticket_complet[2],
                'type': ticket_complet[3],
                'etat': ticket_complet[4],
                'date_creation': ticket_complet[5].isoformat() if ticket_complet[5] else None,
                'date_resolution': ticket_complet[6].isoformat() if ticket_complet[6] else None,
                'client_id': str(ticket_complet[7]),
                'technicien_id': str(ticket_complet[8]) if ticket_complet[8] else None,
                'client_nom': ticket_complet[9],
                'client_email': ticket_complet[10],
                'technicien_nom': None
            }

            client_email = ticket_data['client_email']
            client_nom = ticket_data['client_nom']
            if client_email:
                msg = Message(
                    subject=f"Nouveau ticket créé #{ticket_data['id']}",
                    recipients=[client_email],
                    sender=app.config['MAIL_USERNAME']
                )
                msg.body = f"""
        Bonjour {client_nom},

        Un nouveau ticket a été créé à votre nom.

        Détails du ticket :
        Sujet       : {ticket_data['sujet']}
        Description : {ticket_data['description']}
        Type        : {ticket_data['type']}
        Etat        : {ticket_data['etat']}
        Date        : {ticket_data['date_creation']}

        Merci pour votre confiance.

        Cordialement,
        L'équipe technique de TirsoSupport 
        """
                with app.app_context():
                    mail.send(msg)

            return jsonify({
                'success': True,
                'message': 'Ticket créé avec succès et email envoyé au client',
                'ticket': ticket_data
            }), 201

        else:
            return jsonify({
                'success': True,
                'message': 'Ticket créé avec succès',
                'ticket': {
                    'id': ticket_id,
                    'sujet': sujet,
                    'type': type_ticket,
                    'description': description,
                    'etat': etat,
                    'date_creation': date_creation.isoformat() if date_creation else None,
                    'client_id': str(client_id)
                }
            }), 201
        
    except psycopg2.Error as e:
        if conn:
            conn.rollback()
        logger.error(f"Erreur PostgreSQL lors de la création du ticket: {e}")
        return jsonify({'error': f'Erreur de base de données: {str(e)}'}), 500
    
    except Exception as e:
        if conn:
            conn.rollback()
        logger.error(f"Erreur inattendue lors de la création du ticket: {e}")
        return jsonify({'error': f'Erreur inattendue: {str(e)}'}), 500
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        logger.info("Fin du traitement de création de ticket")

@app.route('/api/tickets/<int:ticket_id>/attachments', methods=['POST'])
def upload_attachment(ticket_id):
    """Upload an attachment for a ticket"""
    conn = None
    cur = None

    try:
        if 'file' not in request.files:
            app.logger.warning("No file in request")
            return jsonify({'error': 'Aucun fichier envoyé'}), 400

        file = request.files['file']

        if file.filename == '':
            app.logger.warning("Empty filename")
            return jsonify({'error': 'Nom de fichier vide'}), 400

        filename = secure_filename(file.filename)
        upload_dir = os.path.abspath('uploads')

        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)

        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        conn = get_db_connection()
        if not conn:
            app.logger.error("Database connection failed")
            return jsonify({'error': 'Erreur connexion base de données'}), 500

        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO piece_jointe (ticket_id, nom, chemin)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (ticket_id, filename, file_path)
        )
        attachment_id = cur.fetchone()[0]
        conn.commit()

        app.logger.info(f"Attachment uploaded: ticket {ticket_id}, file {filename}")

        return jsonify({
            'message': 'Fichier uploadé avec succès',
            'attachment_id': attachment_id,
            'filename': filename
        }), 201

    except Exception as e:
        app.logger.error(f"Upload failed: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


@app.route('/api/tickets/<int:ticket_id>/attachments', methods=['GET'])
def get_ticket_attachments(ticket_id):
    """Récupère la liste des pièces jointes d'un ticket"""
    conn = None
    cur = None
    try:
        logger.info(f" Récupération des pièces jointes pour le ticket {ticket_id}")
        
        if not isinstance(ticket_id, int) or ticket_id <= 0:
            logger.warning(f"ID de ticket invalide: {ticket_id}")
            return jsonify({"error": "ID de ticket invalide"}), 400

        conn = get_db_connection()
        if not conn:
            logger.error("Échec de connexion à la base de données")
            return jsonify({"error": "Échec de connexion à la base"}), 500

        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT pj.id, pj.nom, pj.chemin
            FROM piece_jointe pj
            INNER JOIN ticket t ON pj.ticket_id = t.id
            WHERE t.id = %s
            ORDER BY pj.id DESC
        """, (ticket_id,))
        
        pieces = cur.fetchall()
        logger.info(f" {len(pieces)} pièces jointes trouvées pour le ticket {ticket_id}")
        
        attachments = []
        for piece in pieces:
            file_path = piece["chemin"]
            
            file_size = 0
            file_exists = False
            
            try:
                if os.path.exists(file_path):
                    file_size = os.path.getsize(file_path)
                    file_exists = True
                    logger.debug(f" Fichier trouvé: {file_path} ({file_size} bytes)")
                else:
                    logger.warning(f" Fichier introuvable: {file_path}")
            except Exception as e:
                logger.error(f" Erreur lors de la vérification du fichier {file_path}: {e}")
            
            attachment_info = {
                "id": piece["id"],
                "nom": piece["nom"],
                "taille": file_size,
                "exists": file_exists,
                "chemin": file_path 
            }
            
            attachments.append(attachment_info)

        return jsonify({
            "success": True,
            "attachments": attachments,
            "count": len(attachments)
        })

    except psycopg2.Error as db_error:
        logger.error(f" Erreur PostgreSQL: {db_error}")
        return jsonify({"error": f"Erreur base de données: {str(db_error)}"}), 500
    except Exception as e:
        logger.error(f" Erreur critique: {str(e)}", exc_info=True)
        return jsonify({"error": "Erreur interne du serveur"}), 500
    finally:
        if cur: 
            cur.close()
        if conn: 
            conn.close()


@app.route('/api/tickets/<int:ticket_id>/attachments/<int:attachment_id>', methods=['GET'])
def download_attachment(ticket_id, attachment_id):
    """Télécharge une pièce jointe spécifique"""
    conn = None
    cur = None
    
    try:
        logger.info(f" Téléchargement demandé - Ticket: {ticket_id}, Attachment: {attachment_id}")
        
        if ticket_id <= 0 or attachment_id <= 0:
            logger.warning(f"IDs invalides - Ticket: {ticket_id}, Attachment: {attachment_id}")
            return jsonify({'error': 'IDs invalides'}), 400

        conn = get_db_connection()
        if not conn:
            logger.error("Échec de connexion à la base de données")
            return jsonify({'error': 'Erreur de connexion base de données'}), 500
            
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT pj.chemin, pj.nom 
            FROM piece_jointe pj
            INNER JOIN ticket t ON pj.ticket_id = t.id
            WHERE pj.id = %s AND pj.ticket_id = %s
        """, (attachment_id, ticket_id))
        
        attachment = cur.fetchone()
        if not attachment:
            logger.warning(f"Pièce jointe non trouvée - Ticket: {ticket_id}, Attachment: {attachment_id}")
            return jsonify({'error': 'Pièce jointe non trouvée'}), 404
        
        file_path = attachment['chemin']
        file_name = attachment['nom']
        
        logger.info(f" Fichier demandé: {file_path}")
        
        try:
            base_path = os.path.abspath('uploads')
            absolute_file_path = os.path.abspath(file_path)
            
            if not absolute_file_path.startswith(base_path):
                logger.error(f" Tentative d'accès non autorisé: {absolute_file_path}")
                return jsonify({'error': 'Chemin non autorisé'}), 403
        except Exception as path_error:
            logger.error(f"Erreur de validation du chemin: {path_error}")
            return jsonify({'error': 'Erreur de validation du chemin'}), 400
            
        if not os.path.exists(absolute_file_path):
            logger.error(f"📂 Fichier introuvable sur le disque: {absolute_file_path}")
            return jsonify({'error': 'Fichier introuvable sur le serveur'}), 404
        
        try:
            directory = os.path.dirname(absolute_file_path)
            filename = os.path.basename(absolute_file_path)
            safe_filename = secure_filename(file_name)
            
            logger.info(f" Envoi du fichier: {filename} -> {safe_filename}")
            
            return send_from_directory(
                directory=directory,
                path=filename,
                as_attachment=True,
                download_name=safe_filename
            )
            
        except Exception as send_error:
            logger.error(f"Erreur lors de l'envoi du fichier: {send_error}")
            return jsonify({'error': 'Erreur lors de l\'envoi du fichier'}), 500
        
    except psycopg2.Error as db_error:
        logger.error(f" Erreur PostgreSQL lors du téléchargement: {db_error}")
        return jsonify({'error': 'Erreur base de données'}), 500
    except Exception as e:
        logger.error(f" Erreur critique lors du téléchargement: {str(e)}", exc_info=True)
        return jsonify({'error': 'Erreur de traitement'}), 500
    finally:
        if cur: 
            cur.close()
        if conn: 
            conn.close()


@app.route('/api/tickets/<int:ticket_id>/attachments/download-all', methods=['GET'])
def download_all_attachments(ticket_id):
    """Télécharge toutes les pièces jointes d'un ticket dans un fichier ZIP"""
    import zipfile
    import tempfile
    
    conn = None
    cur = None
    
    try:
        logger.info(f" Téléchargement groupé demandé pour le ticket {ticket_id}")
        
        if ticket_id <= 0:
            return jsonify({'error': 'ID de ticket invalide'}), 400

        conn = get_db_connection()
        if not conn:
            return jsonify({'error': 'Erreur de connexion'}), 500
            
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT pj.nom, pj.chemin 
            FROM piece_jointe pj
            INNER JOIN ticket t ON pj.ticket_id = t.id
            WHERE t.id = %s
        """, (ticket_id,))
        
        attachments = cur.fetchall()
        
        if not attachments:
            return jsonify({'error': 'Aucune pièce jointe trouvée'}), 404
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.zip') as temp_zip:
            with zipfile.ZipFile(temp_zip.name, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for attachment in attachments:
                    file_path = attachment['chemin']
                    file_name = attachment['nom']
                    
                    if os.path.exists(file_path):
                        zip_file.write(file_path, secure_filename(file_name))
                        logger.info(f" Ajouté au ZIP: {file_name}")
                    else:
                        logger.warning(f" Fichier ignoré (introuvable): {file_path}")
            
            zip_filename = f"ticket_{ticket_id}_attachments.zip"
            
            return send_file(
                temp_zip.name,
                as_attachment=True,
                download_name=zip_filename,
                mimetype='application/zip'
            )
            
    except Exception as e:
        logger.error(f" Erreur lors de la création du ZIP: {str(e)}")
        return jsonify({'error': 'Erreur lors de la création du ZIP'}), 500
    finally:
        if cur: 
            cur.close()
        if conn: 
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
    



@app.route('/ticketsTechnicien', methods=['GET'])
def tickets_technicien():
    technicien_id = request.args.get('technicien_id')
    if not technicien_id:
        return jsonify({"error": "technicien_id requis"}), 400

    try:
        con = connect_db()
        cur = con.cursor()
        cur.execute('''
            SELECT 
                t.id,
                u.nom AS client,
                t.sujet,
                t.type,
                t.etat,
                t.date_creation
            FROM ticket t
            JOIN utilisateur u ON t.client_id = u.id
            WHERE t.technicien_id = %s
        ''', (technicien_id,))
        rows = cur.fetchall()
        cur.close()
        con.close()

        tickets = []
        for row in rows:
            tickets.append({
                "id": row[0],
                "client": row[1],
                "sujet": row[2],
                "type": row[3],
                "etat": row[4],
                "date_creation": row[5].strftime('%Y-%m-%d %H:%M')
            })

        return jsonify(tickets)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/ticket/<int:ticket_id>', methods=['GET'])
def get_ticket(ticket_id):
    try:
        con = connect_db()
        cur = con.cursor()

        cur.execute('''
            SELECT 
                t.id,
                u.nom AS client,
                t.sujet,
                t.type,
                t.etat,
                t.description,
                t.date_creation,
                t.date_resolution,
                tech.nom AS technicien
            FROM ticket t
            JOIN utilisateur u ON t.client_id = u.id
            LEFT JOIN utilisateur tech ON t.technicien_id = tech.id
            WHERE t.id = %s
        ''', (ticket_id,))

        row = cur.fetchone()
        cur.close()
        con.close()

        if row:
            ticket = {
                "id": row[0],
                "client": row[1],
                "sujet": row[2],
                "type": row[3],
                "etat": row[4],
                "description": row[5],
                "date_creation": row[6].strftime('%Y-%m-%d %H:%M'),
                "date_resolution": row[7].strftime('%Y-%m-%d %H:%M') if row[7] else None,
                "technicien": row[8] or ""
            }
            return jsonify(ticket)
        else:
            return jsonify({"error": "Ticket non trouvé"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/tickets/<int:ticket_id>/etat', methods=['PUT'])
def update_ticket_etat(ticket_id):
    data = request.get_json()
    new_etat = data.get("etat")
    if not new_etat:
        return {"error": "Etat manquant"}, 400

    conn = get_db_connection()
    if not conn:
        return {"error": "Erreur de connexion DB"}, 500

    try:
        cur = conn.cursor()

        cur.execute("""
            SELECT t.sujet, t.description, t.date_creation, t.type,
                   c.nom, c.email, 
                   tech.nom, tech.email
            FROM ticket t
            JOIN utilisateur c ON t.client_id = c.id
            LEFT JOIN utilisateur tech ON t.technicien_id = tech.id
            WHERE t.id = %s
        """, (ticket_id,))
        ticket_info = cur.fetchone()

        if not ticket_info:
            return {"error": "Ticket introuvable"}, 404

        if new_etat == "RESOLU":
            cur.execute(
                "UPDATE ticket SET etat=%s, date_resolution=NOW() WHERE id=%s",
                (new_etat, ticket_id)
            )
        else:
            cur.execute(
                "UPDATE ticket SET etat=%s, date_resolution=NULL WHERE id=%s",
                (new_etat, ticket_id)
            )

        conn.commit()

        client_nom, client_email = ticket_info[4], ticket_info[5]
        tech_nom, tech_email = ticket_info[6], ticket_info[7]

        subject_map = {
            "RESOLU": f"Ticket #{ticket_id} résolu",
            "EN COURS": f"Ticket #{ticket_id} en cours de traitement"
        }

        if client_email and new_etat in ["RESOLU", "EN COURS"]:
            msg_client = Message(
                subject=subject_map[new_etat],
                recipients=[client_email],
                sender=app.config['MAIL_USERNAME']
            )
            msg_client.body = f"""
Bonjour {client_nom},

Votre ticket #{ticket_id} a été mis à jour.

Etat actuel : {new_etat}

Détails du ticket :
Sujet       : {ticket_info[0]}
Description : {ticket_info[1]}
Date        : {ticket_info[2]}
Type        : {ticket_info[3]}

Merci pour votre patience.

Cordialement,
L'équipe technique de TirsoSupport
"""
            with app.app_context():
                mail.send(msg_client)

        if tech_email:
            msg_tech = Message(
                subject=f"Ticket #{ticket_id} mis à jour par vous ",
                recipients=[tech_email],
                sender=app.config['MAIL_USERNAME']
            )
            msg_tech.body = f"""
Bonjour {tech_nom},

Le ticket #{ticket_id} a été mis à jour.

Nouvel état : {new_etat}

Détails du ticket :
Sujet       : {ticket_info[0]}
Description : {ticket_info[1]}
Date        : {ticket_info[2]}
Type        : {ticket_info[3]}
Client      : {client_nom}

Merci de prendre les mesures nécessaires.

Cordialement,
L'équipe technique de TirsoSupport
"""
            with app.app_context():
                mail.send(msg_tech)

        return {"message": "Etat mis à jour avec succès, notifications envoyées"}

    except Exception as e:
        print(e)
        return {"error": "Erreur lors de la mise à jour"}, 500
    finally:
        cur.close()
        conn.close()






@app.route('/test-email-config', methods=['GET'])
def test_email_config():
    """Route pour tester uniquement la configuration email"""
    print("\n TEST DE CONFIGURATION EMAIL")
    
    try:
        msg = Message(
            subject="Test de configuration",
            recipients=["chaimaebky14@gmail.com"], 
            body="Test de configuration email - si vous recevez ceci, ça marche !",
            sender=app.config['MAIL_USERNAME']
        )
        
        print(f" Test vers: {msg.recipients[0]}")
        
        with app.app_context():
            mail.send(msg)
            
        print(" TEST EMAIL RÉUSSI!")
        return jsonify({
            'success': True, 
            'message': 'Email de test envoyé avec succès'
        }), 200
        
    except Exception as e:
        print(f" ÉCHEC TEST EMAIL: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'error': f'Erreur test email: {str(e)}'
        }), 500
    


with open("chat_data.json", "r", encoding="utf-8") as f:
    chat_data = json.load(f)["questions"]

@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.json
    user_msg = data.get("message", "").lower().strip()
    
    for qa in chat_data:
        if qa["question"] in user_msg:
            return jsonify({"reply": qa["answer"]})
    
    return jsonify({"reply": "Désolé, je n'ai pas compris. Pouvez-vous reformuler ?"})
    
if __name__ == '__main__':
    os.makedirs('uploads/tickets', exist_ok=True)
    app.run(debug=True, host='127.0.0.1', port=5000)