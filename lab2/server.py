from flask import Flask, request, jsonify
import database_helper
import os, binascii

app = Flask(__name__)

loggedInUsers = {}


@app.before_request
def before_request():
    database_helper.connect_db()


@app.teardown_request
def teardown_request(exception):
    database_helper.close_db()


@app.route("/")
def start():
    return app.send_static_file("client.html")


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

    # Insert user into database

    result = database_helper.insert_account(email, password, name, familyName, gender, city, country)

    if result:
        return jsonify({"success": True, "message": "Successfully created a new user."})
    else:
        return jsonify({"success": False, "message": "User already exists."})


@app.route('/sign-in', methods=['POST'])
def login():
    email = request.form['inputEmail']
    password = request.form['inputPassword']

    result = database_helper.fetch_account(email, password)

    if result:
        token = binascii.b2a_hex(os.urandom(32))
        loggedInUsers[token] = email
        return jsonify({"success": True, "message": "Login successful", "data": token})
    else:
        return jsonify({"success": False, "message": "Wrong e-mail or password"})


@app.route('/sign-out', methods=['POST'])
def signout():
    token = request.json['token']
    if token in loggedInUsers:
        del loggedInUsers[token]
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


@app.route('/change-password', methods=['POST'])
def change_password():
    email = request.form['Email']
    password = request.form['oldPassword']
    rptNewPassword = request.form['RptPassword']
    newPassword = request.form['Password']

    if(newPassword != rptNewPassword):
        return jsonify({"success": False, "message": "New passwords doesn't match", "data": ""})

    result = database_helper.fetch_account(email, password)
    if not result:
        return jsonify({"success": False, "message": "Wrong password", "data": ""})

    result = database_helper.change_password(email, newPassword)
    if result:
        return jsonify({"success": True, "message": "Password successfully changed", "data": ""})
    else:
        return jsonify({"success": False, "message": "Could not change password", "data": ""}) #TODO: better output


@app.route('/fetch-messages-token/<token>', methods=['GET'])
def fetch_messages_token(token):
    email = loggedInUsers.get(token)

    if email is None:
        return jsonify({"success": False, "message": "Not logged in."})
    else:
        return fetch_messages_token(email)


@app.route('/fetch-messages-email/<email>', methods=['GET'])
def fetch_messages_email(email):

    messages = database_helper.fetch_messages_by_email(email)

    if messages is None:
        return jsonify({"success": False, "message": "No messages."})
    else:
        return jsonify({"success": True, "message": "Retrieved messages", "data": messages})


if __name__ == '__main__':
    app.run()

