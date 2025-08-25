import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Col, Form, Input, Row, Select, message, Tabs, Card, TimePicker } from 'antd';
import moment from 'moment';

const Profile = () => {
    const { user } = useSelector(state => state.user);
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // Generate time options
    const generateTimeOptions = () => {
        const options = [];
        for (let i = 0; i < 24; i++) {
            const hour = i;
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

            // Add hour:00
            options.push({
                value: `${i.toString().padStart(2, '0')}:00`,
                label: `${displayHour}:00 ${period}`
            });

            // Add hour:30
            options.push({
                value: `${i.toString().padStart(2, '0')}:30`,
                label: `${displayHour}:30 ${period}`
            });
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    // Fetch doctor info
    const getDoctorInfo = async () => {
        try {
            const res = await axios.post(
                "/api/v1/doctor/getDoctorInfo",
                { userId: user._id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );
            if (res.data.success) {
                console.log("Doctor data received:", res.data.data); // Debug log
                setDoctor(res.data.data);
                // Set form values after getting doctor data
                form.setFieldsValue({
                    ...res.data.data,
                    startTime: res.data.data?.timings?.start || "09:00",
                    endTime: res.data.data?.timings?.end || "17:00"
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDoctorInfo();
    }, []);

    // Handle form submission
    const handleFinish = async (values) => {
        try {
            const res = await axios.post(
                '/api/v1/doctor/updateProfile',
                {
                    ...values,
                    userId: user._id,
                    timings: {
                        start: values.startTime,
                        end: values.endTime
                    }
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (res.data.success) {
                message.success('Profile updated successfully');
                // navigate('/');
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            message.error('Something went wrong');
        }
    };

    const items = [
        {
            key: '1',
            label: 'Profile Details',
            children: (
                <>
                    {!loading && (
                        <Form
                            layout="vertical"
                            onFinish={handleFinish}
                            className="m-3"
                            form={form}
                        >
                            <h4>Personal Details</h4>
                            <Row gutter={20}>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="First Name"
                                        name="firstName"
                                        required
                                        rules={[{ required: true }]}
                                    >
                                        <Input type="text" placeholder="your first name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Last Name"
                                        name="lastName"
                                        required
                                        rules={[{ required: true }]}
                                    >
                                        <Input type="text" placeholder="your last name" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Phone No"
                                        name="phone"
                                        required
                                        rules={[{ required: true }]}
                                    >
                                        <Input type="text" placeholder="your contact no" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Email"
                                        name="email"
                                        required
                                        rules={[{ required: true }]}
                                    >
                                        <Input type="email" placeholder="your email address" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item label="Website" name="website">
                                        <Input type="text" placeholder="your website" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Address"
                                        name="address"
                                        required
                                        rules={[{ required: true }]}
                                    >
                                        <Input type="text" placeholder="your clinic address" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <h4>Professional Details</h4>
                            <Row gutter={20}>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Specialization"
                                        name="specialization"
                                        required
                                        rules={[{ required: true, message: 'Please enter your specialization' }]}
                                    >
                                        <Input type="text" placeholder="your specialization" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Experience"
                                        name="experience"
                                        required
                                        rules={[{ required: true, message: 'Please enter your experience' }]}
                                    >
                                        <Input type="text" placeholder="your experience (e.g., 5 years)" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Fees Per Consultation"
                                        name="feesPerConsultation"
                                        required
                                        rules={[{ required: true }]}
                                    >
                                        <Input type="number" placeholder="your consultation fees" />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="Start Time"
                                        name="startTime"
                                        required
                                        rules={[{ required: true, message: 'Please select start time' }]}
                                        initialValue={doctor?.timings?.start || "09:00"}
                                    >
                                        <Select
                                            style={{ width: '100%' }}
                                            options={timeOptions}
                                            placeholder="Select start time"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={24} lg={8}>
                                    <Form.Item
                                        label="End Time"
                                        name="endTime"
                                        required
                                        rules={[{ required: true, message: 'Please select end time' }]}
                                        initialValue={doctor?.timings?.end || "17:00"}
                                    >
                                        <Select
                                            style={{ width: '100%' }}
                                            options={timeOptions}
                                            placeholder="Select end time"
                                        />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="d-flex justify-content-end">
                                <button className="btn btn-primary" type="submit">
                                    Update Profile
                                </button>
                            </div>
                        </Form>
                    )}
                </>
            ),
        },
        {
            key: '2',
            label: 'Account Status',
            children: (
                <Card>
                    <p><strong>Status:</strong> {doctor?.status}</p>
                    <p><strong>Account Type:</strong> Doctor</p>
                    <p><strong>Applied On:</strong> {moment(doctor?.createdAt).format('DD-MM-YYYY')}</p>
                </Card>
            ),
        }
    ];

    return (
        <Layout>
            <h1 className="text-center m-3">Manage Profile</h1>
            {!loading && doctor && (
                <Tabs defaultActiveKey="1" items={items} className="m-3" />
            )}
        </Layout>
    );
};

export default Profile;
