import React from 'react';
import { create } from "zustand";
import axios from "axios";


const useStore = create((set) => ({ 
  // State variables
  files: [],
  setFiles: (files) => set({ files }),
  folders: [],
  setFolders: (folders) => set({ folders }),
  // filteredFiles: [],
  // setFilteredFiles: (filteredFiles) => set({ filteredFiles }),
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
  loading: false,
  setLoading: (loading) => set({ loading }),
  filePage: 1,
  setFilePage: (page) => set({ filePage: page }),
  folderPage: 1,
  setFolderPage: (page) => set({ folderPage: page }),
  itemsPerPage: 12,
  imageId: null,
  setImageId: (id) => set({ imageId: id }),
  showImage: false,
  setShowImage: (show) => set({ showImage: show }),

 
  
 
}));

export default useStore;
