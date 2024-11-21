from flask import Flask, make_response, request, jsonify, session,send_file
from config import db
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_restful import Resource, Api
from users import User
from folders import Folder
from files import File
from datetime import datetime, timedelta
import cloudinary
import cloudinary.uploader
from utils.cloudinaryconfig import cloudconfig
from werkzeug.utils import secure_filename
import os
# New imports for download functionality
import requests
import tempfile
import zipfile
import mimetypes  # Add this for mimetype detection
import time #New
import cloudinary.utils
import io
import shutil
from base64 import b64encode
from dotenv import load_dotenv
load_dotenv()

app = Flask(
    __name__,
    static_url_path='',
    static_folder='../client/dist',
    template_folder='../client/dist'
)
# Check if we are in testing environment
if os.getenv('FLASK_ENV') == 'testing':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Use a separate test database
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///google_drive.db'
#    app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://my_database_7z4p_user:irdDxXIVuOJrPFrVAbRNiW5Aev4O2D32@dpg-csfsmjdsvqrc739r5lvg-a.oregon-postgres.render.com/google_drive_db'

app.config['SECRET_KEY']= "b'!\xb2cO!>P\x82\xddT\xae3\xf26B\x06\xc6\xd2\x99t\x12\x10\x95\x86'"
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)

# UPDATED: Enhanced CORS configuration
CORS(app, resources={
    r"/api/*": {
        "methods": ["GET", "POST", "PUT", "PATCH", "DELETE"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True,
        "expose_headers": ["Content-Disposition"]  # Important for downloads
    }
})



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
                "data": user.to_dict(only = ("id", "first_name", "last_name",'birthday', "gender", "email",'profile_pic' ))
            
            }, 200
            
        return {
            "message": "Invalid email or password"
            }, 401
    
    
class CheckSession(Resource):
    def get(self):
        user_id = session.get('user_id')
        
        if user_id:
            user = User.query.filter_by(id=user_id).first()
            
            if user:
                return user.to_dict(only = ("id", "first_name", "last_name",'birthday', "gender", "email",'profile_pic' ))
            
            return {
                "message": "User not found"
                }, 404
        else:
            return {
                "message": "Not Authorised"
                }, 401

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
        
class UserById(Resource):
    def get(self, id):
        user = User.query.filter_by(id=id).first()
        return (user.to_dict(),200) 
        
    def delete(self, id):
        user = User.query.filter_by(id=id).first()
        
        if user:
            File.query.filter_by(user_id=id).delete(synchronize_session=False)
        
            Folder.query.filter_by(user_id=id).delete(synchronize_session=False)
        
            db.session.delete(user)
            db.session.commit()
            return {}, 204
        return {"message": "User not found"}, 404


class FileInfo(Resource):
    def get(self):
        files_dict = [file.to_dict() for file in File.query.all()]
        return make_response(files_dict, 200)
    
    def post(self):
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'filetype', 'filesize', 'storage_path', 'user_id']
        for field in required_fields:
            if field not in data:
                print("error:" f"'{field}' is required")
                return {"error": f"'{field}' is required"}, 400
        
        # Ensure numeric types are correctly converted
        filesize = int(data['filesize']) if data.get('filesize') else 0
        
        # Handle optional fields and default values
        new_file = File(
            name=data['name'],
            filetype=data['filetype'],
            filesize=filesize,
            storage_path=data['storage_path'],
            created_at=datetime.strptime(data['created_at'], '%Y-%m-%dT%H:%M:%SZ') if data.get('created_at') else datetime.now(),
            updated_at=datetime.now(),
            thumbnail_path=data.get('thumbnail_path'),
            bin=False,
            folder_id=data.get('folder_id'), 
            user_id=data['user_id'],
        )
        
        try:
            db.session.add(new_file)
            db.session.commit()
            return new_file.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error occurred while saving file: {e}")
            return {"error": f"Database error: {str(e)}"}, 500



class FileById(Resource):
    def get(self, id):
        file = File.query.filter_by(id=id).first()
        if file:
            return make_response(file.to_dict(), 200)
        return {
            "message": "File not found"
            }, 404
    
    def patch(self, id):
        file = File.query.filter_by(id=id).first()
        if file:
            data = request.get_json()
            new_name = data.get('name')
            if not new_name:
                return {'error': 'No new name provided'}, 400
            
            file.name = new_name
            db.session.commit()
            
            return {'message': 'Name updated successfully'}, 200
        return {'error': 'File not found'}, 404

    
    def delete(self, id):
        file = File.query.filter_by(id=id).first()
        
        if file:
            db.session.delete(file)
            db.session.commit()
            return {}, 204
        
@app.route('/api/files/<int:id>/move-to-trash', methods=['PATCH'])
def move_file_to_bin(id):
    file = File.query.filter_by(id=id).first()
    if not file:
        return {'error': 'file not found'}, 404
    
    data = request.get_json()
    bin_state = data.get('bin')
    if bin_state is None:
        return {'error': 'Bin state not provided'}, 400
    
    file.bin = bin_state
    db.session.commit()
    
    return {'message': 'File moved to bin', 'file': {'id': file.id, 'bin': file.bin}}, 200


@app.route('/api/files/<int:id>/move', methods=['PATCH'])
def move_file(id):
    
    file = File.query.filter_by(id=id).first()
    if not file:
        return {'error': 'File not found'}, 404
    
    data = request.get_json()
    folder_id = data.get('folder_id')
    
    if folder_id is None:
        return {'error': 'No new parent folder provided'}, 400
    
    file.folder_id = folder_id
    db.session.commit()
     
    return jsonify({"file": {"id": file.id, "folder_id": folder_id}}), 200


          
class FileByUserId(Resource):
    def get(self, id):
        folder_id = request.args.get('folder_id')
        
        if folder_id:
            # Get files specific to a folder for the given user
            files = File.query.filter_by(user_id=id, folder_id=folder_id, bin=False).all()
        else:
            # Get all files for the user if no folder is specified
            files = File.query.filter_by(user_id=id, bin=False).all()
        
        if files:
            files_dict = [file.to_dict() for file in files]
            return make_response(files_dict, 200)
        
        return {"message": "No files found"}, 404

    
class TrashFileByUserId(Resource):
    def get(self, id):
        files = File.query.filter_by(user_id=id, bin=True).all()
        if files:
            files_dict = [file.to_dict() for file in files]
            return make_response(files_dict, 200)
        return {
            "message": "No files found for this user"
            }, 404
           
class FolderInfo(Resource):
    def get(self):
        folders_dict = [folder.to_dict() for folder in Folder.query.filter_by()]
        return jsonify(folders_dict, 200)
   
    
    def post(self):
        data = request.get_json()
        
        name = data.get('name')
        if not name:
            return {'error': 'No name provided'}, 400
        
        parent_folder_id = data.get('parent_id')
        user_id = data.get('user_id')
        
        new_folder = Folder(
            name=name,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            user_id=user_id,
            parent_folder_id=parent_folder_id
        )
        
        try:
            db.session.add(new_folder)
            db.session.commit()
            return new_folder.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500

    
    def post(self):
        data = request.get_json()
        
        name = data.get('name')
        if not name:
            return {'error': 'No name provided'}, 400
        
        parent_folder_id = data.get('parent_id')
        user_id = data.get('user_id')
        
        new_folder = Folder(
            name=name,
            created_at=datetime.now(),
            updated_at=datetime.now(),
            user_id=user_id,
            parent_folder_id=parent_folder_id
        )
        
        try:
            db.session.add(new_folder)
            db.session.commit()
            return new_folder.to_dict(), 201
        except Exception as e:
            db.session.rollback()
            return {"error": str(e)}, 500
    
class FolderContents(Resource):
    def get(self, folder_id):
        try:
            folder = Folder.query.get_or_404(folder_id)
            return {
                'id': folder.id,
                'name': folder.name,
                'files': [
                    {
                        'id': file.id,
                        'name': file.name,
                        'filetype': file.filetype,
                        'filesize': file.filesize,
                        'created_at': file.created_at.isoformat(),
                        'updated_at': file.updated_at.isoformat()
                    } for file in folder.files
                ],
                'subfolders': [
                    {
                        'id': subfolder.id,
                        'name': subfolder.name,
                        'created_at': subfolder.created_at.isoformat(),
                        'updated_at': subfolder.updated_at.isoformat()
                    } for subfolder in folder.subfolders
                ]
            }
        except Exception as e:
            return {'error': str(e)}, 500    
        
class FolderByUserId(Resource):
    def get(self, id):
        parent_folder_id = request.args.get('parent_folder_id')
        
        if parent_folder_id:
            # Get files specific to a folder for the given user
            folders = Folder.query.filter_by(user_id=id, parent_folder_id=parent_folder_id, bin=False).all()
        else:
            # Get all files for the user if no folder is specified
            folders = Folder.query.filter_by(user_id=id, bin=False).all()
        
        if folders:
            folders_dict = [folder.to_dict() for folder in folders]
            return make_response(folders_dict, 200)
        
        return {"message": "No folders found"}, 404

class TrashFolderByUserID(Resource):
     def get(self, id):
        folders = Folder.query.filter_by(user_id=id, bin=True).all()
        if folders:
            folders_dict = [folder.to_dict() for folder in folders]
            return make_response(folders_dict, 200)
        return {
            "message": "No folders found for this user"
            }, 404 

class FolderById(Resource):
    def get(self, id):
        folder = Folder.query.filter_by(id=id).first()
        if folder:
            return make_response(folder.to_dict(), 200)
        return {
            "message": "Folder not found"
            }, 404
        
    def patch(self, id):
        folder = Folder.query.filter_by(id=id).first()
        
        if folder:
            data = request.get_json()
            
            new_name = data.get('name')
            bin_value = data.get('bin')
            parent_folder_id = data.get("parent_folder_id")
            
            if not new_name and bin_value is None:
                return {'error': 'No new name or bin status provided'}, 400
            
            if new_name:
                folder.name = new_name
            
            if bin_value is not None:
                folder.bin = bin_value
            
            if parent_folder_id:
                folder.parent_folder_id = parent_folder_id    
    
            db.session.commit()
            return {'message': 'Folder updated successfully'}, 200
        return {'error': 'Folder not found'}, 404

    def delete(self, id):
        folder = Folder.query.filter_by(id=id).first()
        
        if folder:
            db.session.delete(folder)
            db.session.commit()
            return {}, 204
        
@app.route('/api/folders/<int:id>/move-to-trash', methods=['PATCH'])
def move_folder_to_bin(id):
    folder = Folder.query.filter_by(id=id).first()
    if not folder:
        return {'error': 'Folder not found'}, 404
    
    data = request.get_json()
    bin_state = data.get('bin')
    if bin_state is None:
        return {'error': 'Bin state not provided'}, 400
    
    folder.bin = bin_state
    db.session.commit()
    
    return {'message': 'Folder moved to bin', 'folder': {'id': folder.id, 'bin': folder.bin}}, 200

@app.route('/api/folders/<int:id>/move', methods=['PATCH'])
def move_folder(id):
    
    folder = Folder.query.filter_by(id=id).first()
    if not folder:
        return {'error': 'Folder not found'}, 404
    
    data = request.get_json()
    new_parent_folder_id = data.get('parent_folder_id')
    
    if new_parent_folder_id is None:
        return {'error': 'No new parent folder provided'}, 400
    
    folder.parent_folder_id = new_parent_folder_id
    db.session.commit()

    
    return {'message': 'Folder moved', 'folder': {'id': folder.id, 'parent_folder_id': folder.parent_folder_id}}, 200

#avatar cloudinary api
class UploadAvatar(Resource):
    def post(self, user_id):
        #check if file is submitted as part of the request
        if 'file'  not in request.files:
            return jsonify ({
                'message':'file not part of request'
                }) ,400
        
        #check if request has a file
        file=request.files.get('file')
        if file.filename == '':
            return jsonify({
                'message':'no selected file found'
                }),404
        
        #now we upload to cloudinary
        try:
            result=cloudinary.uploader.upload(file)
            print(result)
            image_url=result['secure_url']
            
            #retrieve the user
            user=User.query.get(user_id)
            user.profile_pic=image_url
            db.session.commit()
            
            return jsonify({
                'message':'image updates successfully',
                'url':image_url
                })
        except Exception as e:
            return jsonify({
                'message':f'the error is {str(e)}'
                }),500


# NEW CLASS: Handle individual file downloads from Cloudinary
class FileDownload(Resource):
    def get(self, file_id):
        try:
            file = File.query.filter_by(id=file_id).first()
            if not file:
                return {'error': 'File not found'}, 404

            if not file.storage_path:
                return {'error': 'File has no storage path'}, 400

            print(f"Attempting to download file: {file.name} from {file.storage_path}")

            # Parse the Cloudinary URL
            url_parts = file.storage_path.split('/upload/')
            if len(url_parts) != 2:
                return {'error': 'Invalid Cloudinary URL'}, 400

            version_and_public_id = url_parts[1]
            extension = version_and_public_id.split('.')[-1].lower()

            # Different handling based on file type
            if extension == 'pdf':
                # For PDFs, use the Cloudinary API to fetch the file
                try:
                    public_id = version_and_public_id.split('/', 1)[1].rsplit('.', 1)[0]
                    timestamp = str(int(time.time()))
                    
                    # Create the parameters for the download URL
                    to_sign = {
                        'public_id': public_id,
                        'timestamp': timestamp,
                        'type': 'upload'
                    }
                    
                    # Generate signature
                    signature = cloudinary.utils.api_sign_request(
                        to_sign,
                        cloudconfig.api_secret
                    )

                    # Construct the API URL
                    api_url = (
                        f"https://api.cloudinary.com/v1_1/{cloudconfig.cloud_name}"
                        f"/resources/image/upload/{public_id}"
                    )

                    # Headers for authentication
                    headers = {
                        'Authorization': f'Basic {b64encode(f"{cloudconfig.api_key}:{cloudconfig.api_secret}".encode()).decode()}',
                        'Content-Type': 'application/json'
                    }

                    # Get the secure URL through the API
                    api_response = requests.get(api_url, headers=headers)
                    api_response.raise_for_status()
                    api_data = api_response.json()

                    # Get the asset URL
                    asset_url = api_data.get('secure_url')
                    if not asset_url:
                        return {'error': 'Could not get secure URL for PDF'}, 500

                    # Download the PDF using the secure URL with authentication
                    asset_headers = {
                        'Authorization': headers['Authorization'],
                        'Accept': 'application/pdf'
                    }
                    
                    pdf_response = requests.get(
                        f"{asset_url}?timestamp={timestamp}&signature={signature}",
                        headers=asset_headers,
                        stream=True
                    )
                    pdf_response.raise_for_status()

                    # Create temporary file
                    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
                    content_size = 0
                    for chunk in pdf_response.iter_content(chunk_size=8192):
                        if chunk:
                            content_size += len(chunk)
                            temp_file.write(chunk)
                    temp_file.close()
                    print(f"Successfully downloaded PDF: {content_size} bytes")

                except Exception as e:
                    print(f"PDF download error: {str(e)}")
                    if hasattr(e, 'response'):
                        print(f"Response content: {e.response.content.decode() if e.response.content else ''}")
                        print(f"Response headers: {dict(e.response.headers)}")
                    return {'error': 'Failed to download PDF'}, 500

            else:
                # For images, use the simple attachment URL
                download_url = f"{url_parts[0]}/upload/fl_attachment/{version_and_public_id}"
                response = requests.get(download_url, stream=True)
                response.raise_for_status()

                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f'.{extension}')
                content_size = 0
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        content_size += len(chunk)
                        temp_file.write(chunk)
                temp_file.close()
                print(f"Successfully downloaded: {content_size} bytes")

            # MIME type mapping
            mime_mapping = {
                'pdf': 'application/pdf',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'txt': 'text/plain',
                'mp4': 'video/mp4',
                'mov': 'video/quicktime',
                'zip': 'application/zip',
            }

            mimetype = mime_mapping.get(extension) or mimetypes.guess_type(file.name)[0] or 'application/octet-stream'

            response = send_file(
                temp_file.name,
                as_attachment=True,
                download_name=file.name,
                mimetype=mimetype
            )

            response.headers.update({
                'Access-Control-Allow-Origin': 'http://localhost:5173',
                'Access-Control-Allow-Credentials': 'true',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            })

            return response

        except requests.RequestException as e:
            print(f"Download error: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Error response content: {e.response.content.decode() if e.response.content else ''}")
                print(f"Error response headers: {dict(e.response.headers)}")
            return {'error': f'Failed to download file: {str(e)}'}, 500

        except Exception as e:
            print(f"General error: {str(e)}")
            import traceback
            traceback.print_exc()
            return {'error': str(e)}, 500

        finally:
            if 'temp_file' in locals():
                try:
                    os.unlink(temp_file.name) 
                    print("Cleaned up temporary file")
                except Exception as e:
                    print(f"Error cleaning up temp file: {str(e)}")

class FolderDownload(Resource):
    def get(self, folder_id):
        try:
            folder = Folder.query.get_or_404(folder_id)
            
            # Create in-memory zip file
            memory_file = io.BytesIO()
            
            with zipfile.ZipFile(memory_file, 'w') as zf:
                # Get all files in folder
                files = File.query.filter_by(folder_id=folder_id).all()
                
                for file in files:
                    try:
# Download each file from Cloudinary
                        response = requests.get(file.storage_path)
                        response.raise_for_status()
                        
                        # Add file to zip with original name
                        zf.writestr(file.name, response.content)
                    except Exception as e:
                        print(f"Error processing file {file.name}: {str(e)}")
                        continue
            
            # Prepare zip file for download
            memory_file.seek(0)
            
            return send_file(
                memory_file,
                as_attachment=True,
                download_name=f'{folder.name}.zip',
                mimetype='application/zip'
            )
            
        except Exception as e:
            return {'error': str(e)}, 500

# Add this new route after your existing routes but before the api.add_resource() calls
@app.route('/api/folders/<int:folder_id>/download', methods=['GET'])
def download_folder(folder_id):
    try:
        folder = Folder.query.filter_by(id=folder_id).first()
        if not folder:
            return {'error': 'Folder not found'}, 404
        
        # Create in-memory zip file
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w') as zf:
            # Get all files in folder
            files = File.query.filter_by(folder_id=folder_id, bin=False).all()
            
            for file in files:
                try:
                    # Download each file from Cloudinary
                    response = requests.get(file.storage_path)
                    response.raise_for_status()
                    
                    # Add file to zip with its original name
                    zf.writestr(file.name, response.content)
                except Exception as e:
                    print(f"Error adding file {file.name} to zip: {str(e)}")
                    continue
        
        # Prepare zip file for download
        memory_file.seek(0)
        
        return send_file(
            memory_file,
            as_attachment=True,
            download_name=f'{folder.name}.zip',
            mimetype='application/zip'
        )
        
    except Exception as e:
        return {'error': str(e)}, 500
# Existing resource registrations
api.add_resource(FileByUserId,"/api/fileuser/<int:id>")
api.add_resource(FolderByUserId, '/api/folderuser/<int:id>', strict_slashes=False)
api.add_resource(FileById,"/api/files/<int:id>") 
api.add_resource(FileInfo, "/api/files",endpoint='files')
api.add_resource(FolderById,"/api/folders/<int:id>") 
api.add_resource(FolderInfo, "/api/folders",endpoint='folders')
api.add_resource(UserById,"/api/users/<int:id>") 
api.add_resource(UserInfo, "/api/users",endpoint='users')
api.add_resource(UserLogin, "/api/login", endpoint='login')
api.add_resource(CheckSession, "/api/session", endpoint='session')
api.add_resource(Logout, "/api/logout", endpoint='logout')
api.add_resource(FolderContents, '/api/content/<int:folder_id>', endpoint='folder_contents')
api.add_resource(UploadAvatar, '/api/upload-avatar/<int:user_id>', endpoint='upload_avatar')
api.add_resource(TrashFolderByUserID, "/api/trash/folder/<int:id>", endpoint='trash_folder')
api.add_resource(TrashFileByUserId, "/api/trash/file/<int:id>", endpoint='trash_file')

# NEW: Add resource routes for download functionality
api.add_resource(FileDownload, '/api/files/<int:file_id>/download', endpoint='file_download')
api.add_resource(FolderDownload, '/api/folders/<int:folder_id>/download', endpoint='folder_download')

# if __name__ == "__main__":
#     port = int(os.environ.get("PORT", 5555))
#     app.run(host="0.0.0.0", port=port, debug=True)

if __name__ == "__main__":
    app.run(port=5555, debug=True)