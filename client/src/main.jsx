import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import routes from './components/Routes'
import { SnackbarProvider } from 'notistack'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SnackbarProvider 
      maxSnack={3} 
      autoHideDuration={10000}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      style={{ zIndex: 1500 }}
    >
      <RouterProvider router={router} />
    </SnackbarProvider>
  </StrictMode>
)
