import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { hideLoading, showLoading } from '../redux/features/alertSlice';
import { setUser } from '../redux/features/userSlice';

export default function ProtectedRoute({ children }) {
    const dispatch = useDispatch();
    const { user } = useSelector(state => state.user);

    // Check authentication status
    const getUser = async () => {
        try {
            dispatch(showLoading());
            const token = localStorage.getItem('token');

            if (!token) {
                dispatch(hideLoading());
                return false;
            }

            const response = await axios.post('/api/v1/user/getUserData', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            dispatch(hideLoading());
            if (response.data.success) {
                dispatch(setUser(response.data.data));
                return true;
            } else {
                localStorage.clear();
                return false;
            }
        } catch (error) {
            dispatch(hideLoading());
            localStorage.clear();
            return false;
        }
    };

    useEffect(() => {
        if (!user) {
            getUser();
        }
    }, [user, dispatch]);

    if (localStorage.getItem('token')) {
        return children;
    } else {
        return <Navigate to="/login" />;
    }
}
