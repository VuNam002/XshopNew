import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
    const token = localStorage.getItem("token");
    const isLogin = !!token; 
    return (
        <>
    
            {isLogin ? (
                <Outlet />
            ) : (
                <Navigate to="/auth/login" replace />
            )}
        </>
    );
}

export default PrivateRoute;