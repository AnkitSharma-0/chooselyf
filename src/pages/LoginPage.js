import React from 'react';
import '../styles/LoginStyles.css';
import { Form, Input, message, Button, Divider } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/features/alertSlice';
import { setUser } from '../redux/features/userSlice';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const onfinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/user/login', values);
            dispatch(hideLoading());
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.user._id);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                message.success('Login Successfully');
                dispatch(setUser(res.data.user));

                // Debug log
                console.log('User data:', res.data.user);
                console.log('Is admin:', res.data.user.isAdmin);

                // Redirect based on user role
                if (res.data.user.isAdmin === true) {
                    console.log('Redirecting to admin users page');
                    navigate('/admin/users');
                } else if (res.data.user.isDoctor === true) {
                    console.log('Redirecting to doctor appointments page');
                    navigate('/doctor/appointments');
                } else {
                    console.log('Redirecting to home page');
                    navigate('/');
                }
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log('Login error:', error);
            if (error.response?.status === 403) {
                message.error(error.response.data.message || 'Your account has been blocked');
            } else {
                message.error('Something went wrong');
            }
        }
    };

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            dispatch(showLoading());
            const decoded = jwtDecode(credentialResponse.credential);

            const res = await axios.post('/api/v1/user/google-login', {
                email: decoded.email,
                name: decoded.name,
                picture: decoded.picture,
                googleId: decoded.sub
            });

            dispatch(hideLoading());
            if (res.data.success) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.user._id);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                message.success('Login Successfully');
                dispatch(setUser(res.data.user));

                // Redirect based on user role
                if (res.data.user.isAdmin === true) {
                    navigate('/admin/users');
                } else if (res.data.user.isDoctor === true) {
                    navigate('/doctor/appointments');
                } else {
                    navigate('/');
                }
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log('Google login error:', error);
            message.error('Error logging in with Google');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Login</h1>
                <Form layout="vertical" onFinish={onfinishHandler}>
                    <Form.Item label="Email" name="email" rules={[{ required: true }]}>
                        <Input type="email" required />
                    </Form.Item>
                    <Form.Item label="Password" name="password" rules={[{ required: true }]}>
                        <Input type="password" required />
                    </Form.Item>
                    <button className="btn btn-primary" type="submit">
                        Login
                    </button>
                </Form>

                <Divider>Or</Divider>

                <div className="google-login-container">
                    <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                            message.error('Google login failed');
                        }}
                        useOneTap
                        theme="outline"
                        size="large"
                        width="100%"
                    />
                </div>

                <div className="mt-3">
                    <Link to="/register">Not a user? Register here</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 