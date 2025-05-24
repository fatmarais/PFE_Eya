import { Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthProvider';

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
