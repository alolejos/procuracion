'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice'; // Asegúrate de importar la acción de logout

const Menu = () => {
  const user = useSelector((state) => state.user); // Leer el estado del usuario desde el store
  const dispatch = useDispatch(); // Obtener la función dispatch

  const handleLogout = () => {
    console.log('User logged out');
    dispatch(logout()); // Despachar la acción de logout
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
        {user.token ? ( // Verificar si hay un token en el store
          <>
            <span>Bienvenido {user.name} {user.surname}</span> {/* Mostrar el nombre de usuario */}
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
