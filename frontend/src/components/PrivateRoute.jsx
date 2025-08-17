import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isLoggedIn = localStorage.getItem("user_id");

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />; 
};

export default PrivateRoute;
