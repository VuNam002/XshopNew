import { Outlet } from "react-router-dom";

const LayoutAuth = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Outlet />
    </div>
  );
};

export default LayoutAuth;

