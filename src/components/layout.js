import React from "react";
import "../styles/layout.css";
import { adminMenu, userMenu } from "./../data/data";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Badge, message } from "antd";
import { Menu } from "antd";
import { CalendarOutlined } from "@ant-design/icons";

const Layout = ({ children }) => {
    const { user } = useSelector((state) => state.user);
    const location = useLocation();
    const navigate = useNavigate();

    // Logout function
    const handleLogout = () => {
        localStorage.clear();
        message.success("Logout Successfully");
        navigate("/login");
    };

    // doctor menu

    const doctorMenu = [
        // {
        //     name: "Home",
        //     path: "/",
        //     icon: "fa-solid fa-house",
        // },
        {
            name: "Appointments",
            path: "/doctor/appointments",
            icon: "fa-solid fa-list",
        },
        {
            name: "Profile",
            path: `/doctor/profile/${user?._id}`,
            icon: "fa-solid fa-user",
        },
    ];






    // Determine Sidebar Menu
    const SidebarMenu = user?.isAdmin ? adminMenu : user?.isDoctor ? doctorMenu : userMenu;

    return (
        <div className="main">
            <div className="layout">
                {/* Sidebar */}
                <div className="sidebar">
                    <div className="logo">
                        <h6>ChooseLyf</h6>
                        <hr />
                    </div>
                    <div className="menu">
                        {SidebarMenu.map((menu, index) => {
                            const isActive = location.pathname === menu.path;
                            return (
                                <div key={index} className={`menu-item ${isActive ? "active" : ""}`}>
                                    <i className={menu.icon}></i>
                                    <Link to={menu.path}>{menu.name}</Link>
                                </div>
                            );
                        })}
                        {/* Logout Option */}
                        <div className="menu-item" onClick={handleLogout}>
                            <i className="fa-solid fa-right-from-bracket"></i>
                            <Link to="/login">Logout</Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="content">
                    {/* Header */}
                    <div className="header">
                        <div className="header-content" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

                            <Badge
                                count={user?.notification?.length || 0}
                                offset={[-5, 5]}
                            >
                                <i
                                    className="fa-solid fa-bell"
                                    style={{
                                        cursor: "pointer",
                                        fontSize: "18px",
                                        color: "#555"
                                    }}
                                    onClick={() => navigate("/notification")}
                                ></i>
                            </Badge>

                            {/* User Name - No Navigation */}
                            <span
                                className="username"
                                style={{
                                    fontSize: "16px",
                                    color: "#333",
                                    fontWeight: "500"
                                }}
                            >
                                {user?.name}
                            </span>
                        </div>
                    </div>

                    {/* Body Content */}
                    <div className="body">{children}</div>
                </div>
            </div>
        </div>
    );
};

export default Layout;
