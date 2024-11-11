from flask import Flask, make_response, request, jsonify
from config import db
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_restful import Resource, Api
from users import User
from folders import Folder
from files import File
from datetime import datetime
import os

app = Flask(__name__,)



# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://my_database_7z4p_user:irdDxXIVuOJrPFrVAbRNiW5Aev4O2D32@dpg-csfsmjdsvqrc739r5lvg-a.oregon-postgres.render.com/google_drive_db'
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///google_drive.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True

CORS(app)
bcrypt = Bcrypt(app)
api = Api(app)
migrate= Migrate(app,db)
db.init_app(app)

@app.route('/api')
def index():
    return '<h1>Index of Google Drive Clone</h1>'


class UserInfo(Resource):
    def get(self):
        users_dict = [user.to_dict() for user in User.query.all()]
        return make_response(users_dict, 200)
    
    def post(self):
        data = request.get_json()
        
        date_obj = datetime.strptime(data.get('birthday'), '%Y-%m-%d').date()

        new_user = User(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            birthday=date_obj,
            gender=data.get('gender'),
            email=data.get('email'),
            password=bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            return new_user.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500
    
    
class FileInfo(Resource):
    def get(self):
        files_dict = [file.to_dict() for file in File.query.all()]
        return make_response(files_dict, 200)
    
class FolderInfo(Resource):
    def get(self):
        folders_dict = [folder.to_dict() for folder in Folder.query.all()]
        return jsonify(folders_dict, 200)
    
    
api.add_resource(UserInfo, "/api/users", endpoint='users')
api.add_resource(FileInfo, "/api/files", endpoint='files')
api.add_resource(FolderInfo, "/api/folders", endpoint='folders')
    


# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5555))
#     app.run(host="0.0.0.0", port=port, debug=True)

if __name__ == "__main__":
    app.run(port=5555, debug=True)