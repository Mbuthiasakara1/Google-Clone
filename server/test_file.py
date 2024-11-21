import pytest
import unittest
from app import app
from config import db
from users import User
from files import File
from folders import Folder
from datetime import datetime
from flask_bcrypt import Bcrypt



class FlaskTests(unittest.TestCase):
    def setUp(self):
        # Configure test database
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:' 
        app.config['TESTING'] = True
        self.client = app.test_client()
        
        # Create test database and tables
        with app.app_context():
            db.create_all()

        
    def tearDown(self):
    # Clean up after each test
     with app.app_context():
        db.session.remove()
        db.drop_all()  # Drop all tables after each test


    def test_index_route(self):
        # Test the index route
        response = self.client.get('/api')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Index of Google Drive Clone', response.data)

    def test_user_registration(self):
        # Test user registration
        test_user = {
            'firstName': 'Test',
            'lastName': 'User',
            'birthday': '1990-01-01',
            'gender': 'Male',
            'email': 'test@example.com',
            'password': 'password123'
        }

        response = self.client.post('/api/users',
                                  json=test_user,
                                  content_type='application/json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['email'], 'test@example.com')

    def test_user_login(self):
        # First create a test user
        with app.app_context():
            bcrypt = Bcrypt(app)
            birthday_date = datetime.strptime('1990-01-01', '%Y-%m-%d').date()

            test_user = User(
                first_name='Test',
                last_name='User',
                birthday=birthday_date,
                gender='Male',
                email='test@example.com',
                password=bcrypt.generate_password_hash('password123').decode('utf-8')
            )
            db.session.add(test_user)
            db.session.commit()

        # Now test the login
        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }
        response = self.client.post('/api/login', json=login_data, content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], 'Login Successful')

    def test_user_info(self):
        # First create a test user
        with app.app_context():
            bcrypt = Bcrypt(app)
            birthday_date = datetime.strptime('1990-01-01', '%Y-%m-%d').date()

            test_user = User(
                first_name='Test',
                last_name='User',
                birthday=birthday_date,
                gender='Male',
                email='test@example.com',
                password=bcrypt.generate_password_hash('password123').decode('utf-8')
            )
            db.session.add(test_user)
            db.session.commit()

        # Now test getting user info
        response = self.client.get('/api/users', content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json), 0)

    def test_folder_creation(self):
        # Test creating a new folder
        folder_data = {
            'name': 'Test Folder',
            'user_id': 1
        }

        response = self.client.post('/api/folders',
                                  json=folder_data,
                                  content_type='application/json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['name'], 'Test Folder')

    def test_file_creation(self):
        # Test creating a new file
        file_data = {
            'name': 'Test File',
            'filetype': 'txt',
            'filesize': 1234,
            'storage_path': '/path/to/file',
            'user_id': 1
        }

        response = self.client.post('/api/files',
                                  json=file_data,
                                  content_type='application/json')

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json['name'], 'Test File')

  
    def test_file_update(self):
        file_id = None
        # First create a test file
        with app.app_context():
            test_file = File(
                name='Test File',
                filetype='txt',
                filesize=1234,
                storage_path='/path/to/file',
                user_id=1
            )
            db.session.add(test_file)
            db.session.commit()
            file_id = test_file.id  # Store the ID before 

        # Now test updating the file's name
        updated_file_data = {
            'name': 'Updated File Name'
        }

        response = self.client.patch(f'/api/files/{file_id}', 
                                    json=updated_file_data, 
                                    content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['message'], 'Name updated successfully')


    def test_delete_user(self):
        user_id = None
        # First create a test user
        with app.app_context():
            bcrypt = Bcrypt(app)
            birthday_date = datetime.strptime('1990-01-01', '%Y-%m-%d').date()

            test_user = User(
                first_name='Test',
                last_name='User',
                birthday=birthday_date,
                gender='Male',
                email='test@example.com',
                password=bcrypt.generate_password_hash('password123').decode('utf-8')
            )
            db.session.add(test_user)
            db.session.commit()
            user_id = test_user.id  # Store the ID 

        # Now test deleting the user
        response = self.client.delete(f'/api/users/{user_id}', content_type='application/json')
        self.assertEqual(response.status_code, 204)

    def test_check_session(self):
        # First create a test user and log in
        with app.app_context():
            bcrypt = Bcrypt(app)
            birthday_date = datetime.strptime('1990-01-01', '%Y-%m-%d').date()

            test_user = User(
                first_name='Test',
                last_name='User',
                birthday=birthday_date,
                gender='Male',
                email='test@example.com',
                password=bcrypt.generate_password_hash('password123').decode('utf-8')
            )
            db.session.add(test_user)
            db.session.commit()

        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }

        login_response = self.client.post('/api/login', json=login_data, content_type='application/json')
        self.assertEqual(login_response.status_code, 200)

        # Now test check session
        response = self.client.get('/api/session', content_type='application/json')
        self.assertEqual(response.status_code, 200)

    def test_logout(self):
        # First create a test user and log in
        with app.app_context():
            bcrypt = Bcrypt(app)
            birthday_date = datetime.strptime('1990-01-01', '%Y-%m-%d').date()

            test_user = User(
                first_name='Test',
                last_name='User',
                birthday=birthday_date,
                gender='Male',
                email='test@example.com',
                password=bcrypt.generate_password_hash('password123').decode('utf-8')
            )
            db.session.add(test_user)
            db.session.commit()

        login_data = {
            'email': 'test@example.com',
            'password': 'password123'
        }

        login_response = self.client.post('/api/login', json=login_data, content_type='application/json')
        self.assertEqual(login_response.status_code, 200)

        # Now test logging out
        response = self.client.delete('/api/logout', content_type='application/json')
        self.assertEqual(response.status_code, 200)

if __name__ == '__main__':
    unittest.main()