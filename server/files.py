from config import db, sm
from datetime import datetime

class File(db.Model, sm):
    __tablename__ = 'files'
    
    serialize_rules = (
        '-folder.files',
        '-folder.user',
        '-folder.parent_folder',
        '-folder.subfolders',
        '-user.files',
        '-user.folders',
        '-user.password',
    )

    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    filetype = db.Column(db.String(50), nullable=False)
    filesize = db.Column(db.BigInteger, nullable=False)
    storage_path = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    thumbnail_path = db.Column(db.String(255))
    bin=db.Column(db.Boolean,default=False)
    
    folder_id = db.Column(db.Integer, db.ForeignKey('folders.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    folder = db.relationship('Folder', back_populates='files')
    user = db.relationship('User', back_populates='files')
    
    def __repr__(self):
        return f"<File {self.name}>"