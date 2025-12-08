import React from 'react'
import toast from 'react-hot-toast'

const HomePage = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-base-200">
      <button
        className="btn btn-primary"
        onClick={() => toast.success("🎉 Congrats!")}
      >
        Click me
      </button>
    </div>
  )
}

export default HomePage
