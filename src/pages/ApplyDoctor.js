import React from 'react'
import Layout from '../components/layout'
import axios from '../axios'
import { Col, Form, Input, message, Row, TimePicker, Select } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { showLoading, hideLoading } from '../redux/features/alertSlice'
import moment from 'moment'

const { Option } = Select;

// Generate time options in 12-hour format
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

const ApplyDoctor = () => {
    const { user } = useSelector(state => state.user)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Handle Form
    const handleFinish = async (values) => {
        try {
            dispatch(showLoading())

            // Format timings
            const timings = {
                start: values.startTime,
                end: values.endTime
            };

            // Prepare doctor data
            const doctorData = {
                ...values,
                userId: user._id,
                feesPerConsultation: Number(values.feesPerConsultation),
                timings,
                status: 'pending'
            };

            const res = await axios.post('/api/v1/user/apply-doctor', doctorData);

            dispatch(hideLoading())
            if (res.data.success) {
                message.success(res.data.message)
                navigate('/')
            } else {
                message.error(res.data.message)
            }
        } catch (error) {
            dispatch(hideLoading())
            console.log(error)
            message.error(error.response?.data?.message || "Something went wrong")
        }
    }

    return (
        <Layout>
            <h1 className="text-center">Apply Doctor</h1>
            <Form
                layout="vertical"
                onFinish={handleFinish}
                className="m-3"
                initialValues={{
                    startTime: "09:00",
                    endTime: "17:00"
                }}
            >
                <h4 className="">Personal Details : </h4>
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
                <h4 className='mt-2'>Professional Details :</h4>
                <Row gutter={20}>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item
                            label="Specialization"
                            name="specialization"
                            required
                            rules={[{ required: true }]}
                        >
                            <Input type="text" placeholder="your specialization" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item
                            label="Experience"
                            name="experience"
                            required
                            rules={[{ required: true }]}
                        >
                            <Input type="text" placeholder="your experience" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item
                            label="Fees Per Consultation"
                            name="feesPerConsultation"
                            required
                            rules={[
                                { required: true, message: 'Please enter consultation fees' },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.reject();
                                        const num = Number(value);
                                        if (isNaN(num) || num <= 0) {
                                            return Promise.reject('Please enter a valid positive number');
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input
                                type="number"
                                min="1"
                                placeholder="consultation fees"
                                onChange={(e) => {
                                    // Remove any non-numeric characters except decimal point
                                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                                }}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}>
                        <Form.Item
                            label="Start Time"
                            name="startTime"
                            required
                            rules={[{ required: true, message: 'Please select start time' }]}
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
                        >
                            <Select
                                style={{ width: '100%' }}
                                options={timeOptions}
                                placeholder="Select end time"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={24} lg={8}></Col>
                    <Col xs={24} md={24} lg={8}>
                        <button className="btn btn-primary form-btn" type="submit">
                            Submit
                        </button>
                    </Col>
                </Row>
            </Form>
        </Layout>
    )
}

export default ApplyDoctor
