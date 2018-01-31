from flask import Flask, request, jsonify
import database_helper
import json

app = Flask(__name__)


@app.before_request
def before_request():
    database_helper.connect_db()


@app.teardown_request
def terdown_request(exception):
    database_helper.close_db()


@app.route("/")
def start():
    return app.send_static_file("client.html")


@app.route('/signup', methods=['POST'])
def signup_account():
    name = request.form['Name']
    familyname = request.form['Family']
    gender = request.form['Gender']
    city = request.form['City']
    country = request.form['Country']
    email = request.form['Email']
    password = request.form['Password']
    rptPassword = request.form['RptPassword']

    result = database_helper.insert_account(email, password, name, familyname, gender, city, country)
    if result == True:
        return jsonify({"success": True, "message": "Successfully created a new user."})
    else:
        return jsonify({"success": False, "message": "User already exists."})


if __name__ == '__main__':
    app.run()

