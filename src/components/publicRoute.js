import React from 'react'
import { Navigate } from 'react-router-dom'

export default function publicRoute({ children }) {
    if (localStorage.getItem('token')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.isAdmin) {
            return <Navigate to={'/admin/users'} />
        } else if (user?.isDoctor) {
            return <Navigate to={'/doctor/appointments'} />
        } else {
            return <Navigate to={'/'} />
        }
    }
    return children;
}
