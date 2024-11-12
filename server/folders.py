from config import db, sm
from datetime import datetime


class Folder(db.Model, sm):
    __tablename__ = 'folders'
    
    # serialize_rules = ('-parent_folder.subfolders', '-parent_folder.files', '-user.folders', '-user.password', '-user.email', '-files.user',
    #                    '-files.folder', 'subfolders.parent_folder', '-subfolders.files',)
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)

    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    parent_folder_id = db.Column(db.Integer, db.ForeignKey('folders.id'), nullable=True)
    
    parent_folder = db.relationship('Folder', remote_side=[id], back_populates='subfolders', lazy=True)
    subfolders = db.relationship('Folder', back_populates='parent_folder', lazy=True)
    files = db.relationship('File', back_populates='folder', lazy=True)
    user = db.relationship('User', back_populates='folders')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'user_id': self.user_id,
            'parent_folder_id': self.parent_folder_id,
            'parent_folder_name': self.parent_folder.name if self.parent_folder else None,
            'subfolders': [
                {
                    'id': subfolder.id,
                    'name': subfolder.name,
                    'created_at': subfolder.created_at.isoformat(),
                    'updated_at': subfolder.updated_at.isoformat(),
                }
                for subfolder in self.subfolders
            ],
            'files': [
                {
                    'id': file.id,
                    'name': file.name,
                    'filetype': file.filetype,
                    'filesize': file.filesize,
                    'created_at': file.created_at.isoformat(),
                    'updated_at': file.updated_at.isoformat(),
                }
                for file in self.files
            ],
        }
    
    
    def __repr__(self):
        return f"<Folder {self.name}>" 