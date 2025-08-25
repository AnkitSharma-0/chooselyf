import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { Table, Tag, message, Card, Typography, Space, Button } from 'antd';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Fetch appointments
    const getAppointments = async () => {
        try {
            const res = await axios.get('/api/v1/user/get-user-appointments', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (res.data.success) {
                setAppointments(res.data.data);
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            message.error('Error fetching appointments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAppointments();
    }, []);

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'gold';
            case 'approved':
                return 'green';
            case 'cancelled':
                return 'red';
            default:
                return 'default';
        }
    };

    // Columns for the table
    const columns = [
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            sorter: (a, b) => moment(a.date, 'DD-MM-YYYY').unix() - moment(b.date, 'DD-MM-YYYY').unix()
        },
        {
            title: 'Time',
            dataIndex: 'time',
            key: 'time'
        },
        {
            title: 'Doctor',
            dataIndex: ['doctor', 'name'],
            key: 'doctor',
            render: (text, record) => (
                <Space direction="vertical">
                    <span>{text}</span>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                        {record.doctor.specialization} • {record.doctor.experience} years
                    </span>
                </Space>
            )
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason'
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.toUpperCase()}
                </Tag>
            )
        }
    ];

    return (
        <Layout>
            <div className="container">
                <Card>
                    <Title level={2} style={{ marginBottom: '20px' }}>My Appointments</Title>

                    {appointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Title level={4}>No appointments found</Title>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => navigate('/')}
                                style={{ marginTop: '20px' }}
                            >
                                Book an Appointment
                            </Button>
                        </div>
                    ) : (
                        <Table
                            columns={columns}
                            dataSource={appointments}
                            rowKey="_id"
                            loading={loading}
                            pagination={{
                                pageSize: 10,
                                showSizeChanger: true,
                                showTotal: (total) => `Total ${total} appointments`
                            }}
                        />
                    )}
                </Card>
            </div>
        </Layout>
    );
};

export default Appointments; 