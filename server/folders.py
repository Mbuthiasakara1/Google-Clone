from config import db, sm
from datetime import datetime


class Folder(db.Model, sm):
    __tablename__ = 'folders'
    
    serialize_rules = (
        '-user.folders',
        '-user.files',
        '-user.password',
        '-files.folder',
        '-files.user',
        '-parent_folder.subfolders',
        '-parent_folder.files',
        '-parent_folder.user',
        '-subfolders.parent_folder',
        '-subfolders.files',
        '-subfolders.user',
    )
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    bin=db.Column(db.Boolean,default=False)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    parent_folder_id = db.Column(db.Integer, db.ForeignKey('folders.id'), nullable=True)
    
    parent_folder = db.relationship('Folder', remote_side=[id], back_populates='subfolders', lazy=True)
    subfolders = db.relationship('Folder', back_populates='parent_folder', lazy=True)
    files = db.relationship('File', back_populates='folder', lazy=True)
    user = db.relationship('User', back_populates='folders')
    

    
    
    def __repr__(self):
        return f"<Folder {self.name}>" 