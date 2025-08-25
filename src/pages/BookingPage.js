import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { Form, Input, DatePicker, TimePicker, message, Card, Row, Col, Button, Tag } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';

const BookingPage = () => {
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [form] = Form.useForm();
    const { doctorId } = useParams();
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showBookingForm, setShowBookingForm] = useState(false);

    // Fetch doctor information
    const getDoctorInfo = async () => {
        try {
            const res = await axios.get(`/api/v1/doctor/getDoctorById/${doctorId}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setDoctor(res.data.data);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error('Error fetching doctor information');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDoctorInfo();
    }, [doctorId]);

    // Check availability for selected date and time
    const checkAvailability = async () => {
        if (!selectedDate || !selectedTime) {
            message.error('Please select both date and time');
            return;
        }

        try {
            const res = await axios.post(
                '/api/v1/user/check-availability',
                {
                    doctorId,
                    date: selectedDate.format('YYYY-MM-DD'),
                    time: selectedTime.format('HH:mm')
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (res.data.success) {
                if (res.data.data.isAvailable) {
                    message.success('Time slot is available!');
                    setShowBookingForm(true);
                } else {
                    message.error('This time slot is already booked. Please select a different time.');
                    setShowBookingForm(false);
                }
            }
        } catch (error) {
            console.error('Check Availability Error:', error);
            message.error(error.response?.data?.message || 'Error checking availability');
            setShowBookingForm(false);
        }
    };

    // Handle date selection
    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setAvailableSlots([]);
        setSelectedSlot(null);
        setShowBookingForm(false);
    };

    // Handle time selection
    const handleTimeSelect = (time) => {
        setSelectedTime(time);
        setAvailableSlots([]);
        setSelectedSlot(null);
        setShowBookingForm(false);
    };

    // Handle slot selection
    const handleSlotSelect = (slot) => {
        setSelectedSlot(slot);
        setShowBookingForm(true);
        form.setFieldsValue({ time: moment(slot, 'HH:mm') });
    };

    // Handle booking
    const handleBooking = async () => {
        if (!selectedDate || !selectedTime) {
            message.error('Please select date and time');
            return;
        }

        const reason = form.getFieldValue('reason');

        if (!reason) {
            message.error('Please enter reason for appointment');
            return;
        }

        try {
            const res = await axios.post(
                '/api/v1/user/book-appointment',
                {
                    doctorId,
                    date: selectedDate.format('YYYY-MM-DD'),
                    time: selectedTime.format('HH:mm'),
                    reason: reason
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (res.data.success) {
                message.success('Appointment booked successfully');
                navigate('/appointments');
            }
        } catch (error) {
            if (error.response?.data?.message) {
                message.error(error.response.data.message);
            } else {
                message.error('Error booking appointment');
            }
        }
    };

    // Get doctor's working hours
    const getWorkingHours = () => {
        if (!doctor?.timings) return null;
        return {
            start: moment(doctor.timings.start, 'HH:mm'),
            end: moment(doctor.timings.end, 'HH:mm')
        };
    };

    const disabledTime = () => {
        if (!doctor?.timings) return {};

        const startHour = parseInt(doctor.timings.start.split(':')[0]);
        const startMinute = parseInt(doctor.timings.start.split(':')[1]);
        const endHour = parseInt(doctor.timings.end.split(':')[0]);
        const endMinute = parseInt(doctor.timings.end.split(':')[1]);

        // Calculate the last available slot (30 minutes before end time)
        const lastSlotTime = moment(doctor.timings.end, 'HH:mm').subtract(30, 'minutes');
        const lastSlotHour = lastSlotTime.hour();
        const lastSlotMinute = lastSlotTime.minute();

        return {
            disabledHours: () => {
                const hours = [];
                for (let i = 0; i < 24; i++) {
                    if (i < startHour || i > endHour) {
                        hours.push(i);
                    }
                }
                return hours;
            },
            disabledMinutes: (selectedHour) => {
                const minutes = [];
                // Only allow minutes that are multiples of 30 (0 and 30)
                for (let i = 0; i < 60; i++) {
                    if (i % 30 !== 0) {
                        minutes.push(i);
                    }
                }

                // For start hour, disable minutes before start time
                if (selectedHour === startHour) {
                    for (let i = 0; i < startMinute; i++) {
                        if (!minutes.includes(i)) minutes.push(i);
                    }
                }

                // For end hour, disable minutes after end time
                if (selectedHour === endHour) {
                    for (let i = endMinute; i < 60; i++) {
                        if (!minutes.includes(i)) minutes.push(i);
                    }
                }

                return minutes;
            }
        };
    };

    if (loading) {
        return (
            <Layout>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <h2>Loading...</h2>
                </div>
            </Layout>
        );
    }

    const workingHours = getWorkingHours();

    return (
        <Layout>
            <div className="container">
                <h1 className="text-center" style={{ marginBottom: '20px' }}>Book Appointment</h1>
                <Row gutter={[20, 20]}>
                    <Col xs={24} md={8}>
                        <Card>
                            <div className="doctor-info">
                                <h2 style={{ marginBottom: '20px' }}>Doctor Information</h2>
                                <div className="doctor-details">
                                    <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                                        <strong>Name: </strong>
                                        {doctor && `Dr. ${doctor.firstName} ${doctor.lastName}`}
                                    </p>
                                    <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                                        <strong>Specialization: </strong>
                                        {doctor?.specialization}
                                    </p>
                                    <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                                        <strong>Experience: </strong>
                                        {doctor?.experience} years
                                    </p>
                                    <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                                        <strong>Consultation Fee: </strong>
                                        ₹{doctor?.feesPerConsultation}
                                    </p>
                                    <p style={{ fontSize: '16px', marginBottom: '15px' }}>
                                        <strong>Available Time: </strong>
                                        {doctor?.timings && `${doctor.timings.start} - ${doctor.timings.end}`}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Col>
                    <Col xs={24} md={16}>
                        <Card>
                            <Form layout="vertical" form={form}>
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} md={12}>
                                        <Form.Item
                                            label="Select Date"
                                            required
                                        >
                                            <DatePicker
                                                style={{ width: '100%' }}
                                                format="DD-MM-YYYY"
                                                onChange={handleDateSelect}
                                                disabledDate={(current) => {
                                                    return current && current < moment().startOf('day');
                                                }}
                                            />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Form.Item label="Select Time" required>
                                            <TimePicker
                                                format="hh:mm A"
                                                use12Hours={true}
                                                minuteStep={30}
                                                hideDisabledOptions={true}
                                                disabledTime={disabledTime}
                                                onChange={handleTimeSelect}
                                                value={selectedTime}
                                                showNow={false}
                                                inputReadOnly={true}
                                                style={{ width: '100%' }}
                                            />
                                        </Form.Item>
                                    </Col>
                                </Row>

                                <Form.Item
                                    label="Reason for Visit"
                                    name="reason"
                                    rules={[{ required: true, message: 'Please enter the reason for visit' }]}
                                >
                                    <Input.TextArea
                                        rows={4}
                                        placeholder="Please describe your symptoms or reason for visit"
                                    />
                                </Form.Item>

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        block
                                        onClick={checkAvailability}
                                        disabled={!selectedDate || !selectedTime}
                                        style={{ marginBottom: '10px' }}
                                    >
                                        Check Availability
                                    </Button>

                                    {showBookingForm && (
                                        <Button
                                            type="default"
                                            block
                                            onClick={handleBooking}
                                            style={{ backgroundColor: '#52c41a', color: 'white' }}
                                        >
                                            Book Now
                                        </Button>
                                    )}
                                </Form.Item>
                            </Form>

                            {availableSlots.length > 0 && (
                                <div style={{ marginTop: '20px' }}>
                                    <h4>Available Time Slots:</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {availableSlots.map((slot, index) => (
                                            <Tag
                                                key={index}
                                                color={selectedSlot === slot ? 'blue' : 'green'}
                                                style={{ padding: '8px 12px', cursor: 'pointer' }}
                                                onClick={() => handleSlotSelect(slot)}
                                            >
                                                {slot}
                                            </Tag>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        </Layout>
    );
};

export default BookingPage;
