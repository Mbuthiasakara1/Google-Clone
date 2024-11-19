from users import User
from folders import Folder
from files import File
from app import app
from config import db
from faker import Faker
import random
from datetime import datetime

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
            filesize=fake.random_number(digits=10),  # Keeping filesize as integer
            storage_path=fake.file_path(),
            created_at=fake.date_object(),
            updated_at=fake.date_object(),
            thumbnail_path=fake.file_path() if random.randint(0, 1) == 1 else None,
            folder_id=random.randint(1, 10),
            user_id=random.randint(1, 10),
            bin=False  # Renamed `bin` to `bin`
        )
        files.append(file)
    db.session.add_all(files)
    db.session.commit()
    
    files_data = [
        {
            "name": "document1.pdf",
            "filetype": "pdf",
            "filesize": 2048,  # Use integers for filesize
            "storage_path": "/storage/documents/document1.pdf",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "thumbnail_path": "/storage/thumbnails/document1_thumb.png",
            "folder_id": 6,
            "user_id": 2,
            "bin": False  # Renamed `bin` to `bin`
        },
        {
            "name": "image1.jpg",
            "filetype": "jpg",
            "filesize": 3072,  # Use integers for filesize
            "storage_path": "/storage/images/image1.jpg",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "thumbnail_path": "/storage/thumbnails/image1_thumb.png",
            "folder_id": 6,
            "user_id": 2,
            "bin": False  # Renamed `bin` to `bin`
        },
        {
            "name": "audio1.mp3",
            "filetype": "mp3",
            "filesize": 5120,  # Use integers for filesize
            "storage_path": "/storage/audio/audio1.mp3",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "thumbnail_path": "/storage/thumbnails/audio1_thumb.png",
            "folder_id": 7,
            "user_id": 2,
            "bin": False  # Renamed `bin` to `bin`
        },
        {
            "name": "video1.mp4",
            "filetype": "mp4",
            "filesize": 51200,  # Use integers for filesize
            "storage_path": "/storage/videos/video1.mp4",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "thumbnail_path": "/storage/thumbnails/video1_thumb.png",
            "folder_id": 7,
            "user_id": 2,
            "bin": False  # Renamed `bin` to `bin`
        },
        {
            "name": "spreadsheet1.xlsx",
            "filetype": "xlsx",
            "filesize": 10240,  # Use integers for filesize
            "storage_path": "/storage/spreadsheets/spreadsheet1.xlsx",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "thumbnail_path": "/storage/thumbnails/spreadsheet1_thumb.png",
            "folder_id": 8,
            "user_id": 2,
            "bin": False  # Renamed `bin` to `bin`
        }
    ]

    # Convert files_data to File instances and add to session
    predefined_files = [File(**data) for data in files_data]
    db.session.add_all(predefined_files)
    db.session.commit()

    print("Seeding Complete!")
