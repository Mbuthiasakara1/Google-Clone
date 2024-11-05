from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
import os

app = Flask(__name__,)

db = SQLAlchemy()

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://my_database_7z4p_user:irdDxXIVuOJrPFrVAbRNiW5Aev4O2D32@dpg-csfsmjdsvqrc739r5lvg-a.oregon-postgres.render.com/google_drive_db'
migrate= Migrate(app,db)
db.init_app(app)



@app.route('/')
def home():
    return 'Hello, World!'


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5555))
    app.run(host="0.0.0.0", port=port, debug=True)