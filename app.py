from flask import Flask, request, jsonify, render_template, session
import pymysql.cursors
import hashlib

app = Flask(__name__)

#=========================================
# Global Variables and Constants

#=========================================
# SQL Database Parameters
DB_CONFIG = {
    'host':'localhost',
    'user':'reachkart_db_user',
    'password':'reachkart_db_password',
    'db':'reachkart_db'
}

#=========================================

#=========================================
# Web Application endpoints
# homepage endpoint
@app.route('/')
def home():
    return render_template('home.html')

# endpoint for sigin test
@app.route('/signin', methods=['POST'])
def signin():
    try:
        email = request.json['email']
        password = request.json['password']
        # hash the password
        password = hashlib.sha256(password.encode()).hexdigest()
        # connect to the database
        conn = pymysql.connect(**DB_CONFIG)
        cursor = conn.cursor()
        sql = "SELECT * FROM users WHERE email=%s AND password=%s"
        cursor.execute(sql, (email, password))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        if result:
            return jsonify({'status':'success', 'message':'User signed in successfully'}), 200
        else:
            return jsonify({'status':'error', 'message':'Invalid credentials'}), 200
    except Exception as e:
        return jsonify({'status':'error', 'message':'An error occurred'}), 500
#=========================================
# Auxilliary Functions used in the Web Application
#=========================================

#=========================================
# run the application
if __name__ == '__main__':
    app.run(debug=True,port=9999)