import React from 'react'
import {create} from "zustand";

const useStore = create((set) => ({
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
  filePage: 1,
  folderPage: 1,
  setFilePage: (page) => set({ filePage: page }),
  setFolderPage: (page) => set({ folderPage: page }),
  itemsPerPage: 12,
}));
export default useStore;