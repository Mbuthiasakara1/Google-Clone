from users import User
from folders import Folder
from files import File
from app import app
from config import db
from faker import Faker
import random

fake = Faker()

with app.app_context():
    
    print("Clearing folder table...")
    
    Folder.query.delete()
    
    print("Seeding Folder Data...")
    
    folders = []
    for _ in range(5):
        folder = Folder(
            name=fake.word(),
            created_at=fake.date_object(),
            updated_at=fake.date_object(),
            user_id=random.randint(1,10),
            parent_folder_id=random.choice([None, random.randint(1,5)]) if random.randint(0, 1) == 1 else None,
            bin=False
            )
        folders.append(folder)
    db.session.add_all(folders)
    db.session.commit()
    
    print("Folder seeding complete!")