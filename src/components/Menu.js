'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const Menu = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user data
    const simulatedUserData = {
      name: 'Juan Pérez', // Replace with actual user data
    };

    // Simulate user being logged in
    setUser(simulatedUserData);
  }, []);

  const handleLogout = () => {
    // Simulate logout functionality
    console.log('User logged out');
    setUser(null); // Clear user data on logout
    // Implement actual logout logic here, such as clearing tokens
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <ul className="flex space-x-4">
        <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
        <li><Link href="/expedientes" className="hover:text-gray-300">Expedientes</Link></li>
        <li><Link href="/reportes" className="hover:text-gray-300">Reportes</Link></li>
        <li><Link href="/perfil" className="hover:text-gray-300">Perfil</Link></li>
      </ul>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span>{user.name}</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Menu;
