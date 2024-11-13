from flask import Flask, make_response, request, jsonify, session
from config import db
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_restful import Resource, Api
from users import User
from folders import Folder
from files import File
from datetime import datetime, timedelta

app = Flask(__name__)



# app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://my_database_7z4p_user:irdDxXIVuOJrPFrVAbRNiW5Aev4O2D32@dpg-csfsmjdsvqrc739r5lvg-a.oregon-postgres.render.com/google_drive_db'
app.config['SECRET_KEY']= "b'!\xb2cO!>P\x82\xddT\xae3\xf26B\x06\xc6\xd2\x99t\x12\x10\x95\x86'"
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SQLALCHEMY_DATABASE_URI']='sqlite:///google_drive.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)  # Or however long you need


CORS(app, origins=["http://127.0.0.1:5173"], supports_credentials=True)
bcrypt = Bcrypt(app)
api = Api(app)
migrate= Migrate(app,db)
db.init_app(app)

@app.route('/api')
def index():
    return '<h1>Index of Google Drive Clone</h1>'


class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and bcrypt.check_password_hash(user.password, data['password']):
            session['user_id'] = user.id
            return{
                "message":"Login Successful",
                "data": user.to_dict(only = ("id", "first_name", "last_name", "gender", "email" ))
            }, 200
            
        return {"message": "Invalid email or password"}, 401
    
    
class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        
        if user_id:
            user = User.query.filter_by(id=user_id).first()
            
            if user:
                return user.to_dict(only = ("id", "first_name", "last_name", "gender", "email" ))
            
            return {"message": "User not found"}, 404
        else:
            return {"message": "Not Authorised"}, 401

class Logout(Resource):
    def delete(self):
        session.pop('user_id', None)
        return {}, 200

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
api.add_resource(UserLogin, "/api/login", endpoint='login')
api.add_resource(CheckSession, "/api/session", endpoint='session')
api.add_resource(Logout, "/api/logout", endpoint='logout')
api.add_resource(FileInfo, "/api/files", endpoint='files')
api.add_resource(FolderInfo, "/api/folders", endpoint='folders')
    


# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5555))
#     app.run(host="0.0.0.0", port=port, debug=True)

if __name__ == "__main__":
    app.run(port=5555, debug=True)