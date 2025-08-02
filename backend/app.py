from flask import Flask, request, jsonify
import psycopg2
import bcrypt
from flask_cors import CORS


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


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)