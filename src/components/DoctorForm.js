import React from 'react';
import { Form, Row, Col, Input, TimePicker, Button } from 'antd';
import moment from 'moment';

const DoctorForm = ({ handleFinish, initivalValues }) => {
    return (
        <Form
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{
                ...initivalValues,
                timings: initivalValues?.timings?.map(time => moment(time, 'HH:mm'))
            }}
        >
            <h4 className='text-light'>Personal Details : </h4>
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
            <h4 className='text-light'>Professional Details :</h4>
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
                        rules={[{ required: true }]}
                    >
                        <Input type="text" placeholder="your consultation fees" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={24} lg={8}>
                    <Form.Item
                        label="Timings"
                        name="timings"
                        required
                        rules={[{ required: true }]}
                    >
                        <TimePicker.RangePicker
                            format="HH:mm"
                            style={{ width: '100%' }}
                            minuteStep={30}
                            showNow={false}
                            popupStyle={{
                                position: 'fixed',
                                zIndex: 1000,
                                maxHeight: '80vh',
                                overflow: 'auto'
                            }}
                            popupClassName="time-picker-popup"
                        />
                    </Form.Item>
                </Col>
            </Row>
            <div className="d-flex justify-content-end">
                <Button className="primary-button" htmlType="submit">
                    Submit
                </Button>
            </div>
        </Form>
    );
};

export default DoctorForm; 