import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../services/axiosInstance";

const PrivateRoute = ({ allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/" replace />; // pas connecté

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // rôle non autorisé
  }

  return <Outlet />;
};

export default PrivateRoute;
