import React from 'react'
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import { Toaster } from 'react-hot-toast'

const App = () => {
  return (
    <div data-theme="cupcake">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
      <Toaster position='top-right'/>
    </div>
  )
}

export default App
