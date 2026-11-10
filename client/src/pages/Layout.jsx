import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useSelector } from "react-redux";
import Loader from "../components/Loader";
import Login from "./Login";
import ChatBot from "../components/ChatBot";

const Layout = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {user ? (
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Outlet />
          <ChatBot />
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default Layout;