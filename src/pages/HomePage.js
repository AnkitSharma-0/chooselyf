import React, { useState, useEffect } from 'react';
import Layout from '../components/layout';
import axios from 'axios';
import { message, Card, Button } from 'antd';
import DoctorList from '../components/DoctorList';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [specialization, setSpecialization] = useState(null);
  const navigate = useNavigate();

  const getDoctors = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      const res = await axios.get('/api/v1/user/getAllDoctors', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) {
        setDoctors(res.data.data);
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        message.error('Something went wrong while fetching doctors');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getDoctors();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <Layout>
      <div className="home-container">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            Loading doctors...
          </div>
        ) : !localStorage.getItem('token') ? (
          <Card style={{ maxWidth: 500, margin: '50px auto', textAlign: 'center' }}>
            <h2>Welcome to ChooseLyf</h2>
            <p>Please login to view our doctors and book appointments.</p>
            <Button type="primary" onClick={handleLoginClick}>
              Login Now
            </Button>
          </Card>
        ) : (
          <DoctorList
            doctors={doctors}
            loading={loading}
            specialization={specialization}
            onSpecializationChange={setSpecialization}
          />
        )}
      </div>
    </Layout>
  );
};

export default HomePage;
