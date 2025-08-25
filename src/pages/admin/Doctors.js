import React, { useEffect, useState } from 'react'
import Layout from '../../components/layout'
import axios from 'axios'
import { Table, message, Select, Popconfirm } from 'antd'
import '../../styles/AdminStyles.css'

const { Option } = Select;

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    specialization: '',
    status: ''
  });

  // Get Doctors
  const getDoctors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
        ...(filters.specialization && { specialization: filters.specialization }),
        ...(filters.status && { status: filters.status })
      }).toString();

      const res = await axios.get(`/api/v1/admin/getAllDoctors?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data?.success) {
        setDoctors(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching doctors:', error.response?.data || error);
      message.error('Error fetching doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDoctors();
  }, [currentPage, pageSize, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleDelete = async (doctorId) => {
    try {
      const res = await axios.delete(`/api/v1/admin/deleteDoctor/${doctorId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data?.success) {
        message.success('Doctor deleted successfully');
        getDoctors();
      }
    } catch (error) {
      console.error(error);
      message.error('Error deleting doctor');
    }
  };

  // Get unique specializations from doctors
  const specializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  // antd table col
  const columns = [
    {
      title: 'Name',
      render: (text, record) => (
        <span>{record.firstName} {record.lastName}</span>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (text, record) => (
        <span className={`status-badge ${record.status === 'approved' ? 'bg-success' :
          record.status === 'rejected' ? 'bg-danger' :
            'bg-warning'
          }`}>
          {record.status ? record.status.toUpperCase() : 'PENDING'}
        </span>
      )
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization'
    },
    {
      title: 'Experience',
      dataIndex: 'experience',
      render: (text) => `${text} years`
    },
    {
      title: 'Timings',
      render: (text, record) => (
        <span>{record.timings?.start} - {record.timings?.end}</span>
      )
    },
    {
      title: 'Actions',
      className: 'action-column',
      render: (text, record) => (
        <div className="d-flex gap-2">
          <Select
            value={record.status}
            style={{ width: 120 }}
            onChange={(value) => handleStatusChange(record._id, value)}
          >
            <Option value="pending">Pending</Option>
            <Option value="approved">Approved</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
          <Popconfirm
            title="Are you sure you want to delete this doctor?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <button className="btn btn-danger">Delete</button>
          </Popconfirm>
        </div>
      )
    }
  ];

  const handleStatusChange = async (doctorId, status) => {
    try {
      const res = await axios.post('/api/v1/admin/changeStatus', {
        doctorId,
        status
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.data?.success) {
        message.success('Doctor status updated successfully');
        await getDoctors();
      }
    } catch (error) {
      console.error(error);
      message.error('Error updating doctor status');
    }
  };

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center mb-4">Doctors List</h1>

        <div className="table-container">
          {/* Filters */}
          <div className="mb-4 d-flex gap-3">
            <Select
              style={{ width: 200 }}
              placeholder="Filter by Specialization"
              onChange={(value) => handleFilterChange('specialization', value)}
              allowClear
            >
              {specializations.map(spec => (
                <Option key={spec} value={spec}>{spec}</Option>
              ))}
            </Select>

            <Select
              style={{ width: 200 }}
              placeholder="Filter by Status"
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
            >
              <Option value="pending">Pending</Option>
              <Option value="approved">Approved</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>

          <Table
            loading={loading}
            columns={columns}
            dataSource={doctors}
            locale={{
              emptyText: 'No doctors found'
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: (page, pageSize) => {
                setCurrentPage(page);
                setPageSize(pageSize);
              },
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
            }}
            rowKey="_id"
            className="admin-table"
          />
        </div>
      </div>
    </Layout>
  )
}

export default Doctors 