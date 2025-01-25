import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/chat');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <div>Loading...</div>;
}

export default AuthCallback;