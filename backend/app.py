from flask import Flask, request, jsonify
import psycopg2
import bcrypt
from flask_cors import CORS
from collections import defaultdict
from datetime import datetime




app = Flask(__name__)
CORS(app) 

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
    

@app.route('/admin' , methods = ['GET'])
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
        "dureeMoyenne": dureeMoyenne ,
        "ticketStati": data 
    })


@app.route('/ticketsAdmin' , methods = ['GET'])
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

@app.route('/assign-technicien' , methods = ['POST'])
def assign_technicien():
    data = request.json
    technicien_id = data.get('technicien_id')
    ticket_id = data.get('ticket_id')

    con = connect_db()
    cur = con.cursor()
    try:
        cur.execute(
            "UPDATE ticket SET technicien_id = %s WHERE id = %s",
            (technicien_id, ticket_id)
        )
        con.commit()
        return jsonify({'success': True}), 200
    except Exception as e:
        con.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        con.close()

@app.route('/listeUtilisateurs' , methods = ['GET'])
def listeUtilisateurs() :
    con = connect_db()
    cur = con.cursor()

    cur.execute("SELECT id , nom, email , role FROM utilisateur ")
    rows = cur.fetchall()

   
    utilisateurs = [
        {"id": row[0], "nom": row[1], "email": row[2] , "role" : row[3]}
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
    data = request.json
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
        UPDATE utilisateur
        SET nom = %s, email = %s, role = %s
        WHERE id = %s
    """, (data['nom'], data['email'], data['role'], id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'message': 'Utilisateur modifié avec succès'})

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


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)