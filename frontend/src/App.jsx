import React from 'react'
import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'

const App = () => {
  return (
    <div>
      <button onClick={()=>{toast.success("congrats")}}>Click me</button>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  )
}

export default App
