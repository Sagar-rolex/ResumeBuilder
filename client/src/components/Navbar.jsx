import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'
import DarkModeToggle from './DarkModeToggle'

const Navbar = () => {

   const {user} = useSelector(state => state.auth)
   const dispatch = useDispatch()

    const navigate = useNavigate()

    const logoutUser = ()=>{
        navigate('/')
        dispatch(logout())
    }

  return (
    <div className='shadow bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700'>
      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3.5 text-slate-800 dark:text-slate-200 transition-all'>
        <Link to='/' className="text-xl font-bold">
            Resume Builder
        </Link>
        <div className='flex items-center gap-4 text-sm'>
            <p className='max-sm:hidden'>Hi, {user?.name}</p>
            <button onClick={logoutUser} className='min-h-11 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 sm:px-7 py-1.5 rounded-full active:scale-95 transition-all text-slate-800 dark:text-slate-200'>Logout</button>
            <DarkModeToggle />
        </div>
      </nav>
    </div>
  )
}

export default Navbar
