import React from 'react';
import { create } from "zustand";
import axios from "axios";


const useStore = create((set) => ({ 
  // State variables
  user:null,
  setUser:(user)=>set({user}),
  loading:false,
  setLoading:(loading)=>set({loading}),
  files: [],
  setFiles: (files) => set({ files }),
  folders: [],
  setFolders: (folders) => set({ folders }),
  filteredFiles: [],
  setFilteredFiles: (filteredFiles) => set({ filteredFiles }),
  filteredFolders: [],
  setFilteredFolders: (filteredFolders) => set({ filteredFolders }),
  viewType: "folders",
  setViewType: (viewType) => set({ viewType }),
  currentFolderId: null,
  setCurrentFolderId: (id) => set({ currentFolderId: id }),
  folderName: "Drive",
  setFolderName: (name) => set({ folderName: name }),
  folderHistory: [],
  setFolderHistory: (history) => set({ folderHistory: history }),
  filePage: 1,
  setFilePage: (page) => set({ filePage: page }),
  folderPage: 1,
  setFolderPage: (page) => set({ folderPage: page }),
  itemsPerPage: 12,
  imageId: null,
  setImageId: (id) => set({ imageId: id }),
  showImage: false,
  setShowImage: (show) => set({ showImage: show }),
  isCreatingFolder:false,
  setIsCreatingFolder:(isCreatingFolder)=>set({isCreatingFolder}),
  isUploading:false,
  setIsUploading:(isUploading)=>set({isUploading}),
  rename:"",
  setRename:(rename)=>set({rename}),
  showDropdown:false,
  setShowDropdown:(showDropdown)=>set({showDropdown}),
  
  moveItem:null,
  setMoveItem:(item)=>set({moveItem:item}),
  renameId:null,
  setRenameId:(id)=>set({renameId:id}),
  // Actions
 
}));

export default useStore;
