from users import User
from folders import Folder
from files import File
from app import app, bcrypt
from config import db
from faker import Faker
import random

fake = Faker()

with app.app_context():
    
    print('Clearing user table...')
    User.query.delete()
    
    print('Seeding user data..')
    
    users = []
    genders = ["Male", "Female", "Prefer not to say", "Other"]
    for _ in range(10):
        user = User(
            first_name=fake.name(),
            last_name=fake.name(),
            birthday=fake.date_object(),
            gender=random.choice(genders),
            email=fake.email(),
            password=bcrypt.generate_password_hash('123Abc').decode('utf-8')
        )
        users.append(user)
    db.session.add_all(users)
    db.session.commit()
    
    print("Seeding Complete!")