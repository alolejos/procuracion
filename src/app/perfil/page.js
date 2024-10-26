'use client';
import { useState, useEffect } from 'react';

export default function Perfil() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Simulate fetching user data
    const fetchUserData = async () => {
      // Simulate an API call to get user data
      const simulatedUserData = {
        name: 'Juan Pérez', // Replace with actual user data
      };

      setUserName(simulatedUserData.name);
    };

    fetchUserData();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Perfil</h1>
      <p className="text-lg mb-4">Bienvenido, {userName}</p>
      <p>Manage your profile settings here.</p>
      {/* Add more content and functionality as needed */}
    </div>
  );
}
