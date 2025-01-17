from flask import Flask, request, jsonify, render_template
import requests
import pymysql
import sqlite3

app = Flask(__name__)

#=========================================
# Global Variables and Constants


#=========================================

#=========================================
# Web Application endpoints
# homepage endpoint
@app.route('/')
def home():
    return render_template('index.html')

#=========================================
# Auxilliary Functions used in the Web Application
#=========================================

#=========================================
# run the application
if __name__ == '__main__':
    app.run(debug=True,port=9999)