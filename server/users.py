from config import db, sm

class User(db.Model, sm):
    __tablename__ = 'users'
    
    serialize_rules = (
        '-folders.user',
        '-folders.files.folder',
        '-folders.files.user',
        '-folders.subfolders.parent_folder',
        '-folders.parent_folder',
        '-files.user',
        '-files.folder.files',
        '-files.folder.user',
        '-password',
    )
                   
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    birthday = db.Column(db.Date)
    gender = db.Column(db.String)
    email = db.Column(db.String, unique=True)
    password = db.Column(db.String)
    profile_pic=db.Column(db.String,nullable=True)
    
    folders = db.relationship('Folder', back_populates='user', lazy=True, passive_deletes=True)
    files = db.relationship('File', back_populates='user', lazy=True, passive_deletes=True)

    

    

    def __repr__(self):
        return f'<User {self.first_name} {self.last_name} {self.birthday} {self.gender}>'