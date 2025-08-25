import React from 'react';
import { Card, Row, Col, Select, Spin, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const DoctorList = ({ doctors, loading, specialization, onSpecializationChange }) => {
    const navigate = useNavigate();

    const filteredDoctors = specialization
        ? doctors.filter(doctor => doctor.specialization === specialization)
        : doctors;

    const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!doctors.length) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Empty description="No doctors found" />
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Our Doctors</h1>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <Select
                    placeholder="Filter by Specialization"
                    style={{ width: 250 }}
                    onChange={onSpecializationChange}
                    allowClear
                >
                    {specializations.map(spec => (
                        <Option key={spec} value={spec}>{spec}</Option>
                    ))}
                </Select>
            </div>

            <Row gutter={[24, 24]}>
                {filteredDoctors.map(doctor => (
                    <Col xs={24} md={12} lg={8} xl={6} key={doctor._id}>
                        <Card
                            hoverable
                            onClick={() => navigate(`/doctor/book-appointment/${doctor._id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Meta
                                title={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                                description={
                                    <div>
                                        <p><strong>Specialization:</strong> {doctor.specialization}</p>
                                        <p><strong>Experience:</strong> {doctor.experience} years</p>
                                        <p><strong>Phone:</strong> {doctor.phone}</p>
                                        <p><strong>Consultation Fee:</strong> ₹{doctor.feesPerConsultation}</p>
                                        <p><strong>Timing:</strong> {doctor.timings?.start} - {doctor.timings?.end}</p>
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default DoctorList;
