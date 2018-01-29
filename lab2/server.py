from flask import Flask
app = Flask(__name__)

@app.route("/")
def start():
    return app.send_static_file("client.html")

if __name__ == '__main__':
	app.run()

