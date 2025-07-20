import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const storedUser = JSON.parse(localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo"));
  
  if (!storedUser || storedUser.role !== "admin") {
    return <Navigate to="/admingiris" replace />;
  }

  return children;
}
