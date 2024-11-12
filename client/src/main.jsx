import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './components/Routes'
import { SnackbarProvider } from 'notistack'
import { AuthProvider } from './components/AuthContext'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider maxSnack={3} autoHideDuration={10000} anchorOrigin={{ vertical: 'top', horizontal: 'center', }} >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </SnackbarProvider>
  </StrictMode>
)
