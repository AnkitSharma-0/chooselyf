import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout';
import axios from 'axios';
import { Table, Tag, message, Card, Typography, Space, Button, Modal, Spin, Result } from 'antd';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../redux/features/userSlice';

const { Title } = Typography;
const { confirm } = Modal;

const DoctorAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector(state => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Fetch appointments
    const getAppointments = async () => {
        try {
            setError(null);
            setLoading(true);

            if (!user?._id) {
                setLoading(false);
                return;
            }

            const res = await axios.post('/api/v1/doctor/get-doctor-appointments', {
                userId: user._id
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.data.success) {
                setAppointments(res.data.data);
            } else {
                setError(res.data.message);
            }
        } catch (error) {
            console.error('Error fetching appointments:', error);

            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                setError(error.response?.data?.message || 'Error fetching appointments');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getAppointments();
    }, [user]);

    // Handle status update
    const handleStatusUpdate = async (appointmentId, status) => {
        try {
            const res = await axios.post('/api/v1/doctor/update-appointment-status', {
                appointmentId,
                status
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.data.success) {
                message.success(`Appointment ${status} successfully`);
                // Update appointments list locally instead of making another API call
                setAppointments(prevAppointments =>
                    prevAppointments.map(app =>
                        app._id === appointmentId
                            ? { ...app, status }
                            : app
                    )
                );

                // Update Redux store with new user data if available
                if (res.data.data.user) {
                    dispatch(setUser(res.data.data.user));
                    localStorage.setItem('user', JSON.stringify(res.data.data.user));
                }
            } else {
                message.error(res.data.message);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
            message.error('Error updating appointment status');
        }
    };

    // Show confirmation modal
    const showConfirmModal = (appointmentId, status) => {
        const action = status === 'confirmed' ? 'confirm' : 'cancel';
        confirm({
            title: `Are you sure you want to ${action} this appointment?`,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: status === 'confirmed' ? 'primary' : 'danger',
            cancelText: 'No',
            onOk() {
                handleStatusUpdate(appointmentId, status);
            },
        });
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
            title: 'Patient',
            dataIndex: ['user', 'name'],
            key: 'patient',
            render: (text, record) => (
                <Space direction="vertical">
                    <span>{text}</span>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                        {record.user.email} • {record.user.phone}
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
                <Tag color={status === 'confirmed' ? 'green' : status === 'cancelled' ? 'red' : 'gold'}>
                    {status.toUpperCase()}
                </Tag>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                record.status === 'pending' && (
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => showConfirmModal(record._id, 'confirmed')}
                        >
                            Confirm
                        </Button>
                        <Button
                            danger
                            onClick={() => showConfirmModal(record._id, 'cancelled')}
                        >
                            Cancel
                        </Button>
                    </Space>
                )
            )
        }
    ];

    if (loading) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Spin size="large" />
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Card>
                        <Title level={4}>Please log in to view appointments</Title>
                        <Button type="primary" onClick={() => navigate('/login')}>
                            Go to Login
                        </Button>
                    </Card>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                    <Result
                        status="error"
                        title="Error"
                        subTitle={error}
                        extra={[
                            <Button type="primary" key="retry" onClick={getAppointments}>
                                Retry
                            </Button>
                        ]}
                    />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container">
                <Card>
                    <Title level={2} style={{ marginBottom: '20px' }}>My Appointments</Title>

                    {appointments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>
                            <Title level={4}>No appointments found</Title>
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

export default DoctorAppointments; 