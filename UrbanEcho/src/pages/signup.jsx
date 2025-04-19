import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

const Signup = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('citizen');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    uid: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            user_type: userType
          }
        }
      });

      if (signUpError) throw signUpError;

      if (!data?.user?.id) {
        throw new Error('No user ID returned from signup');
      }

      // 2. Insert into users table without select
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          user_type: userType,
          authority_uid: userType === 'authority' ? formData.uid : null
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      // 3. Redirect to login
      navigate('/login', {
        state: { message: 'Account created! Please check your email to verify your account.' }
      });

    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Urban Echo</h1>
          <Link to="/login" className="px-4 py-2 rounded hover:bg-blue-700">Login</Link>
        </div>
      </nav>

      <main className="container mx-auto max-w-md mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              value={formData.password}
              onChange={handleChange}
              required 
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
            />
          </div>

          <div>
            <label htmlFor="user-type" className="block text-sm font-medium text-gray-700">I am a:</label>
            <select
              id="user-type"
              name="user-type"
              value={userType}
              onChange={handleUserTypeChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            >
              <option value="citizen">Citizen</option>
              <option value="authority">Local Authority</option>
              <option value="other">Other</option>
            </select>
          </div>

          {userType === 'authority' && (
            <div>
              <label htmlFor="uid" className="block text-sm font-medium text-gray-700">Authority UID</label>
              <input 
                type="text" 
                id="uid" 
                name="uid" 
                value={formData.uid}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" 
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-500">Log in</Link>
        </p>
      </main>

      <footer className="bg-gray-100 mt-10 py-6">
        <div className="container mx-auto text-right text-sm text-gray-500">
          <p>© 2025 Urban Echo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
