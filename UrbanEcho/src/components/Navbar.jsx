import React from 'react';

const Navbar = () => (
  <nav className="bg-blue-600 text-white p-4">
    <div className="container mx-auto flex justify-between items-center">
      <h1 className="animate-bounce text-2xl font-bold">Urban Echo</h1>
      <div className="flex items-center gap-2">
        <a href="/login" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">Login</a>
        <a href="/signup" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100">Sign Up</a>
      </div>
    </div>
  </nav>
);

export default Navbar;
