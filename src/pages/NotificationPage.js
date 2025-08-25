import React, { useEffect } from "react";
import Layout from "./../components/layout";
import { message, Tabs } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/features/alertSlice";
import { setUser } from "../redux/features/userSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    console.log("User notifications:", user?.notification, user?.seennotification);
  }, [user]);

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (!user?._id) return;

    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/get-all-notification",
        { userId: user._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      dispatch(hideLoading());

      if (res.data.success) {
        message.success(res.data.message);

        // Update Redux state (move unread → read)
        dispatch(setUser({
          ...user,
          seennotification: [...(user.seennotification || []), ...(user.notification || [])],
          notification: [],
        }));
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error:", error);
      message.error("Something went wrong");
    }
  };

  // Delete all read notifications
  const handleDeleteAllRead = async () => {
    if (!user?._id) return;

    try {
      dispatch(showLoading());
      const res = await axios.post(
        "/api/v1/user/delete-all-notifications",
        { userId: user._id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      dispatch(hideLoading());

      if (res.data.success) {
        message.success(res.data.message);

        // Clear read notifications in Redux store
        dispatch(setUser({
          ...user,
          seennotification: [],
        }));
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      console.error("Error:", error);
      message.error("Something went wrong");
    }
  };

  return (
    <Layout>
      <h4 className="p-3 text-center">Notification Page</h4>
      <Tabs>
        {/* Unread Notifications */}
        <Tabs.TabPane tab="Unread" key="unread">
          <div className="d-flex justify-content-end">
            <h4 className="p-2 text-primary" style={{ cursor: "pointer" }} onClick={handleMarkAllRead}>
              Mark All Read
            </h4>
          </div>
          {user?.notification?.length > 0 ? (
            user.notification.map((notificationMsg, index) => (
              <div
                key={index}
                className="card my-2 p-2"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(notificationMsg.onClickPath)}
              >
                <div className="card-text">{notificationMsg.message}</div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No unread notifications</p>
          )}
        </Tabs.TabPane>

        {/* Read Notifications */}
        <Tabs.TabPane tab="Read" key="read">
          <div className="d-flex justify-content-end">
            <h4 className="p-2 text-danger" style={{ cursor: "pointer" }} onClick={handleDeleteAllRead}>
              Delete All Read
            </h4>
          </div>
          {user?.seennotification?.length > 0 ? (
            user.seennotification.map((notificationMsg, index) => (
              <div key={index} className="card my-2 p-2">
                <div className="card-text">{notificationMsg.message}</div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted">No read notifications</p>
          )}
        </Tabs.TabPane>
      </Tabs>
    </Layout>
  );
};

export default NotificationPage;
