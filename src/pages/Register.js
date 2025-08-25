import React from 'react'
import '../styles/RegisterStyles.css';
import { Form, Input, message, Divider } from 'antd'
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'
import { useDispatch } from 'react-redux';
import { hideLoading, showLoading } from '../redux/features/alertSlice';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Register = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch();

    const OnFinishHandler = async (values) => {
        try {
            dispatch(showLoading());
            const res = await axios.post('/api/v1/user/register', values)
            dispatch(hideLoading())
            if (res.data.success) {
                message.success('Registration successful')
                navigate('/login')
            }
            else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            message.error('Something Went wrong')
        }
    }

    const handleGoogleRegister = async (credentialResponse) => {
        try {
            dispatch(showLoading());
            const decoded = jwtDecode(credentialResponse.credential);

            const res = await axios.post('/api/v1/user/google-register', {
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
                message.success('Registration Successful');
                navigate('/');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            dispatch(hideLoading());
            console.log('Google registration error:', error);
            message.error('Error registering with Google');
        }
    };

    return (
        <div className='form-container'>
            <div className='register-box'>
                <Form layout='vertical' onFinish={OnFinishHandler} className='register-form'>
                    <h3 className='text-center'>Register Form</h3>
                    <Form.Item label="Name" name='name' rules={[{ required: true, message: 'Please input your name!' }]}>
                        <Input type='text' required />
                    </Form.Item>
                    <Form.Item label="Email" name='email' rules={[{ required: true, message: 'Please input your email!' }]}>
                        <Input type='email' required />
                    </Form.Item>
                    <Form.Item label="Password" name='password' rules={[{ required: true, message: 'Please input your password!' }]}>
                        <Input type='password' required />
                    </Form.Item>
                    <button className='btn btn-primary' type='submit'>Register</button>
                </Form>

                <Divider>Or</Divider>

                <div className="google-login-container">
                    <GoogleLogin
                        onSuccess={handleGoogleRegister}
                        onError={() => {
                            message.error('Google registration failed');
                        }}
                        useOneTap
                        theme="outline"
                        size="large"
                        width="100%"
                    />
                </div>

                <div className="mt-3">
                    <Link to='/login' className='m-2'>Already user? Login here</Link>
                </div>
            </div>
        </div>
    )
}

export default Register