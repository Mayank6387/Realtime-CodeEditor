import React from 'react'
import {BrowserRouter,Routes,Route} from "react-router-dom"
import { Home } from './pages/Home'
import EditorPage from './pages/EditorPage'
import { Toaster } from 'react-hot-toast'          //container for toast messages always given globally

const App = () => {
  return (
    <>
    <div>
      <Toaster position='top-center'
      toastOptions={{
        success:{
          duration: 2000,
          theme:{
            primary:'#4aed88'
          }
        }
      }}/>           
    </div>
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/editor/:roomId' element={<EditorPage/>} />
    </Routes>
    </BrowserRouter>
    </>
  )
}

export default App