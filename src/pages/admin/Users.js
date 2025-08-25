import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../../components/layout';
import { Table, message, Input } from 'antd';
import moment from 'moment';
import '../../styles/AdminStyles.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');

  const getUsersData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/v1/admin/getAllUsers', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (error) {
      console.log(error);
      message.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsersData();
  }, []);

  const handleSearch = (value) => {
    setSearchText(value);
    // Filter local data based on search text
    if (!value) {
      getUsersData(); // Reset to first page when clearing search
      return;
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchText.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleBlock = async (userId) => {
    try {
      if (!userId) {
        message.error('Invalid user ID');
        return;
      }

      const res = await axios.post(
        '/api/v1/admin/blockUser',
        { userId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (res.data.success) {
        message.success(res.data.message);
        getUsersData(); // Refresh the users list
      } else {
        message.error(res.data.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      message.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Doctor',
      dataIndex: 'isDoctor',
      key: 'isDoctor',
      render: (isDoctor) => (
        <span className={`status-badge ${isDoctor ? 'bg-success' : 'bg-secondary'}`}>
          {isDoctor ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Admin',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin) => (
        <span className={`status-badge ${isAdmin ? 'bg-primary' : 'bg-secondary'}`}>
          {isAdmin ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('DD-MM-YYYY HH:mm'),
    },
    {
      title: 'Status',
      dataIndex: 'isBlocked',
      key: 'isBlocked',
      render: (isBlocked) => (
        <span className={`status-badge ${isBlocked ? 'bg-danger' : 'bg-success'}`}>
          {isBlocked ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="d-flex">
          <button
            className={`btn ${record.isBlocked ? 'btn-success' : 'btn-danger'} ms-2`}
            onClick={() => handleBlock(record._id)}
          >
            {record.isBlocked ? 'Unblock' : 'Block'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="container">
        <h1 className="text-center mb-4">Users Management</h1>

        <div className="table-container">
          {/* Search Bar */}
          <div className="mb-4">
            <Input.Search
              placeholder="Search by name or email"
              allowClear
              enterButton
              size="large"
              onSearch={handleSearch}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ maxWidth: 400 }}
            />
          </div>

          <Table
            loading={loading}
            columns={columns}
            dataSource={filteredUsers}
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
  );
};

export default Users; 