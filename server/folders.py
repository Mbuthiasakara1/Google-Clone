from config import db, sm
from datetime import datetime

class Folder(db.Model, sm):
    __tablename__ = 'folders'
    
    # serialize_rules = (
    #     '-user.folders',
    #     '-user.files',
    #     '-user.password',
    #     '-files.folder',
    #     '-files.user',
    #     '-parent_folder.subfolders',
    #     '-parent_folder.files',
    #     '-parent_folder.user',
    #     '-subfolders.parent_folder',
    #     '-subfolders.files',
    #     '-subfolders.user',
    # )
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    bin = db.Column(db.Boolean, default=False)

    user_id = db.Column(db.Integer,db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    parent_folder_id = db.Column(db.Integer,db.ForeignKey('folders.id', ondelete='CASCADE'), nullable=True)
    
    parent_folder = db.relationship('Folder', remote_side=[id], back_populates='subfolders', lazy=True)
    subfolders = db.relationship('Folder', back_populates='parent_folder', cascade='all, delete-orphan', lazy=True)
    files = db.relationship('File', back_populates='folder', cascade='all, delete-orphan', lazy=True)
    user = db.relationship('User', back_populates='folders')
    
    def __repr__(self):
        return f"<Folder {self.name}>"
    
    def to_dict(self, include_subfolders=False):
        data = {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'bin': self.bin,
            'user_id': self.user_id,
            'parent_folder_id': self.parent_folder_id,
        }
        if include_subfolders:
            data['subfolders'] = [subfolder.to_dict() for subfolder in self.subfolders]
        return data
