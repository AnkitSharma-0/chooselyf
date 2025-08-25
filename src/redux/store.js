import { configureStore } from '@reduxjs/toolkit';
import { alertSlice } from './features/alertSlice';
import userReducer from './features/userSlice';

export default configureStore({
    reducer: {
        alerts: alertSlice.reducer,
        user: userReducer
    }
})