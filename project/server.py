from geventwebsocket.handler import WebSocketHandler
from gevent.pywsgi import WSGIServer
from flask import Flask, request, jsonify
import database_helper
import os
import sys
import random
import binascii
import json
import hashlib
from flask_bcrypt import Bcrypt
import time

app = Flask(__name__)
bcrypt = Bcrypt(app)

loggedInUsers = {}
loggedInUsersE = {}
clientSockets = {}

#Send out live data on every socket, called in events that affects data
def send_livedata():
    for email in clientSockets:
        csocket = clientSockets[email]
        sendMsg = {}
        sendMsg["type"] = "livedata"
        sendMsg["nrmyposts"] = len(database_helper.fetch_posts_by_email(email))
        sendMsg["nrwallposts"] = len(database_helper.fetch_messages_by_email(email))
        sendMsg["nronlineusers"] = len(loggedInUsers)
        csocket.send(json.dumps(sendMsg))

@app.before_request
def before_request():
    database_helper.connect_db()


@app.teardown_request
def teardown_request(exception):
    database_helper.close_db()


@app.route("/")
@app.route("/home.html")
@app.route("/browse.html")
@app.route("/account.html")
def start():
    return app.send_static_file("client.html")


def hashPassword(password):
    return bcrypt.generate_password_hash(password).decode('utf-8')


#check if recived hash is same as stored password
def checkHash(hash, password):
    return bcrypt.check_password_hash(hash, password)


#check if the hashed data matches the recived hashed token
def checkToken(data, recivedtoken):
    hashed_token = hashlib.sha256(data.encode('utf-8')).hexdigest()
    return hashed_token != recivedtoken


@app.route('/sign-up', methods=['POST'])
def signup_account():
    name = request.form['Name']
    familyName = request.form['Family']
    gender = request.form['Gender']
    city = request.form['City']
    country = request.form['Country']
    email = request.form['Email']
    password = request.form['Password']
    rptPassword = request.form['RptPassword']

    if password != rptPassword:
        return jsonify({"success": False, "message": "Passwords dont match"})

    if len(password) < 5:
        return jsonify({"success": False, "message": "Password needs to contain 5 characters."})

    if not (name and familyName and gender and country and email):
        return jsonify({"success": False, "message": "Not all areas filled."})

    # Insert user into database, hash and salt password
    csprng = random.SystemRandom()
    salt = str(csprng.randint(0, sys.maxint))
    hash_pw = hashPassword(password + salt)

    result = database_helper.insert_account(email, hash_pw, name, familyName, gender, city, country, salt)

    if result:
        return jsonify({"success": True, "message": "Successfully created a new user."})
    else:
        return jsonify({"success": False, "message": "User already exists."})


# Adds user to the list of logged in users and generates a random token to send back
@app.route('/sign-in', methods=['POST'])
def login():
    email = request.form['inputEmail']
    password = request.form['inputPassword']

    result = database_helper.fetch_account(email)

    if result:
        hash_pw = result[0][0]
        salt = result[0][2]

        if checkHash(hash_pw, password+salt):
            token = binascii.b2a_hex(os.urandom(32))
            loggedInUsers[token] = email
            loggedInUsersE[email] = token
            send_livedata()
            return jsonify({"success": True, "message": "Login successful", "data": token})

    return jsonify({"success": False, "message": "Wrong e-mail or password"})


# Deletes users token from logged in users
@app.route('/sign-out', methods=['POST'])
def signout():
    token = request.json['token']

    if token in loggedInUsers:
        del loggedInUsers[token]
        send_livedata()
        return jsonify({"success": True, "message": "Successfully signed out."})
    else:
        return jsonify({"success": False, "message": "You are not signed in."})


@app.route('/fetch-user-token/<token>', methods=['GET'])
def fetch_user_token(token):

    email = loggedInUsers.get(token)

    if email is None:
        return jsonify({"success": False, "message": "No such token."})
    else:
        return fetch_user_email(email)


@app.route('/fetch-user-email/<email>', methods=['GET'])
def fetch_user_email(email):
    user = database_helper.fetch_account_data(email)
    if user:
        return jsonify({"success": True, "message": "Retrieved email successfully.", "data": user})
    else:
        return jsonify({"success": False, "message": "No such user"})


# Changes stored password, hash + salt new password before storing it
@app.route('/change-password/<token>', methods=['POST'])
def change_password(token):

    email = request.json["email"]
    userToken = loggedInUsersE.get(email)

    if userToken is None:
        return jsonify({"success": False, "message": "No such user."})

    newPassword = request.json['newPass']
    oldPw = request.json['oldPass']

    data = '/change-password/' + userToken
    if checkToken(data, token):
        return jsonify({"success": False, "message": "No such user."})

    result = database_helper.fetch_account(email)

    # Hash and salt new password
    if result:
        hash_pw = result[0][0]
        salt = result[0][2]
        if checkHash(hash_pw, oldPw + salt):
            new_hash_pw = hashPassword(newPassword + salt)
            result = database_helper.change_password(email, new_hash_pw)

    if result:
        return jsonify({"success": True, "message": "Password successfully changed"})
    else:
        return jsonify({"success": False, "message": "Could not change password"})


@app.route('/fetch-messages-token/<token>/<email>', methods=['GET'])
def fetch_messages_token(token, email):

    userToken = loggedInUsersE.get(email)

    if userToken is None:
        return jsonify({"success": False, "message": "No such token."})
    else:
        data = '/change-password/' + userToken
        if checkToken(data, token):
            return fetch_messages_email(email)


@app.route('/fetch-messages-email/<email>', methods=['GET'])
def fetch_messages_email(email):

    messages = database_helper.fetch_messages_by_email(email)
    if messages is None:
        return jsonify({"success": False, "message": "No messages."})
    else:
        return jsonify({"success": True, "message": "Retrieved messages", "data": messages})


@app.route('/add-message', methods=['POST'])
def post_message():
    token = request.json['token']
    message = request.json['message']
    reciever = request.json['email']
    sender = request.json['senderEmail']
    database_helper.add_message(sender, reciever, message)

    data = 'add-message' + loggedInUsersE.get(sender)
    send_livedata()
    if checkToken(data, token):
        return jsonify({"success": True, "message": "Added message."})
    else:
        return jsonify({"success": False, "message": "Failed to add message."})

#Handle websocket connections
@app.route('/api')
def api():
    if request.environ.get('wsgi.websocket'):
        ws = request.environ['wsgi.websocket']
        email = "";
        while not ws.closed:
            message = ws.receive()
            try:
                msg = json.loads(message)
                if msg['type'] == "login":
                    email = msg['email']
                    if email in clientSockets.keys(): #If the user is already logged in somewhere
                        sendMsg = {"type": "logout"} #Tell theold client to log out
                        clientSockets[email].send(json.dumps(sendMsg))
                        clientSockets[email] = ws
                    else:
                        clientSockets[email] = ws
                elif msg["type"] == "livedata": #Only used as first update of the live data
                    sendMsg = {}
                    sendMsg["type"] = "livedata"
                    sendMsg["nrmyposts"] = len(database_helper.fetch_posts_by_email(email))
                    sendMsg["nrwallposts"] = len(database_helper.fetch_messages_by_email(email))
                    sendMsg["nronlineusers"] = len(loggedInUsers)
                    ws.send(json.dumps(sendMsg))
                else:
                    print("Unknown message received")
            except:
                print(message)
        if email != "": #Remove socket from dictionary when socket connection is closed
            if ws == clientSockets[email]:
                del clientSockets[email]
    return 'OK'


if __name__ == '__main__':
    app.debug = True
    http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
    http_server.serve_forever()
    app.run()
