import React, { useState } from 'react';

const Signup = () => {
  const [userType, setUserType] = useState('citizen');

  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col justify-between">
      <nav className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Urban Echo</h1>
          <a href="/login" className="px-4 py-2 rounded hover:bg-blue-700">Login</a>
        </div>
      </nav>

      <main className="container mx-auto max-w-md mt-10 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">Create Your Account</h2>

        <form id="signup-form" className="space-y-8">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" id="name" name="name" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" id="email" name="email" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" id="password" name="password" required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
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
              <input type="text" id="uid" name="uid" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">Sign Up</button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600 hover:text-blue-500">Log in</a>
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
