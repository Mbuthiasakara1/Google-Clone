from users import User
from folders import Folder
from files import File
from app import app
from config import db
from faker import Faker
import random

fake = Faker()

with app.app_context():
    
    print("Clearing file table...")
    
    File.query.delete()
    
    print("Seeding File Data...")
    
    files = []
    for _ in range(50):
        file = File(
            name=fake.word(),
            filetype=fake.file_extension(),
            filesize=fake.random_number(digits=10),
            storage_path=fake.file_path(),
            created_at=fake.date_object(),
            updated_at=fake.date_object(),
            thumbnail_path=fake.file_path() if random.randint(0, 1) == 1 else None,
            folder_id=random.randint(1, 10),
            user_id=random.randint(1, 10),
            bin = False
            )
        files.append(file)
    db.session.add_all(files)
    db.session.commit()
    
    print("Seeding Complete!")      
    
    