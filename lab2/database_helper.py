import sqlite3
from flask import g, jsonify

DATABASE = 'database.db'


def connect_db():
    g.db = sqlite3.connect(DATABASE)


def close_db():
    db = getattr(g, 'db', None)
    if db is not None:
        db.close()


def insert_account(email, password, firstname, familyname, gender, city, country):

    try:
        cursor = g.db.execute("insert into accounts values(?,?,?,?,?,?,?)", [email, password, firstname, familyname, gender, city, country])
        g.db.commit()
        return True
    except:
        return False
