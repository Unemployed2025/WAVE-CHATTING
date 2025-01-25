import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { userAPI } from '../../api/userRoute'
import { FcGoogle } from 'react-icons/fc';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: ''
  });
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const formRef = useRef(null);
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // Initial animations
    gsap.set(containerRef.current, { opacity: 0 });
    gsap.set(cardRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline();
    tl.to(containerRef.current, {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut"
    })
      .to(cardRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = isLogin
        ? await userAPI.login({ email: formData.email, password: formData.password })
        : await userAPI.register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          fullName: formData.fullName
        });

      localStorage.setItem('token', response.token);

      // Animate out
      gsap.to(cardRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.5,
        onComplete: () => navigate('/chat')
      });

    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const toggleMode = () => {
    gsap.to(cardRef.current, {
      scale: 0.95,
      duration: 0.1,
      ease: "power2.inOut",
      onComplete: () => {
        setIsLogin(!isLogin);
        gsap.to(cardRef.current, {
          scale: 1,
          duration: 0.1,
          ease: "back.out(1.7)"
        });
      }
    });
  };

  return (

    <div
      ref={containerRef}
      className="min-h-screen flex items-center justify-center bg-cover bg-center from-gray-100 via-white to-gray-100"
      style={{
        backgroundImage: "url('/login.jpg')",
        opacity: 0
      }}
    >
      <div
        ref={cardRef}
        className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLogin
              ? 'Enter your details to sign in'
              : 'Fill in your information to get started'}
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required={!isLogin}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required={!isLogin}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => window.location.href = 'http://localhost:3000/api/auth/google'}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FcGoogle className="text-xl" />
              Continue with Google
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={toggleMode}
            className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;