import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (token) {
    // Redirect to the page user came from or default to chat
    return <Navigate to={location.state?.from?.pathname || '/chat'} replace />;
  }

  return children;
}

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default PublicRoute;