import sqlite3
from flask import g, jsonify

DATABASE = 'database.db'


def get_db():
    db = getattr(g, 'db', None)
    if db is None:
        connect_db()
    return db


def connect_db():
    g.db = sqlite3.connect(DATABASE)


def close_db():
    db = get_db()
    if db is not None:
        db.close()


def query_db(query, args=(), one=False):
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv

def insert_account(email, password, firstname, familyname, gender, city, country, salt):

    try:
        query_db("INSERT INTO accounts VALUES (?,?,?,?,?,?,?,?)", [email, password, firstname, familyname, gender, city, country, salt])
        get_db().commit()
        return True
    except sqlite3.Error as e:
        print "An error occurred:", e.args[0]
        return False


def fetch_account(email):
    user = query_db('SELECT password, email, salt FROM accounts WHERE email=?', [email])
    if user:
        return user
    else:
        return False


def fetch_account_data(email):
    user = query_db('SELECT  * FROM accounts WHERE email = ?', [email], one=True)
    if user is None:
        return False
    else:
        return user


def fetch_messages_by_email(email):
    user = query_db('SELECT  * FROM messages WHERE receiver = ?', [email])
    if user is None:
        return False
    else:
        return user


def add_message(sender, receiver, message):
    try:
        query_db('INSERT INTO messages VALUES (?, ?, ?)', [sender, receiver, message])
        get_db().commit()
        return True
    except sqlite3.Error as e:
        print "An error occurred:", e.args[0]
        return False


def change_password(email, password): #password = newpassword
    try:
        query_db('UPDATE accounts SET password=? WHERE(email=?)', [password, email])
        get_db().commit()
        return True
    except sqlite3.Error as e:
        print "An error occurred:", e.args[0]
        return False


def fetch_posts_by_email(email):
    user = query_db('SELECT  * FROM messages WHERE sender = ?', [email])
    if user is None:
        return False
    else:
        return user