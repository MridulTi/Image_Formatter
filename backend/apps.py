from flask import Flask
from config import app
from controllers.formatters import formatter

app.register_blueprint(formatter)

if __name__=="__main__":
    app.run(debug=True)