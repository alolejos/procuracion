'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/userSlice'; // Asegúrate de importar la acción de logout
import Image from 'next/image';
import axios from 'axios';

const Menu = () => {
  const user = useSelector((state) => state.user); // Leer el estado del usuario desde el store
  const dispatch = useDispatch(); // Obtener la función dispatch
  const router = useRouter();

  const handleLogout = () => {
    console.log('User logged out');
    dispatch(logout()); // Despachar la acción de logout
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
        {user.token ? (
          <>
        <ul className="flex items-center space-x-8">
          <li>
            <Link href="/" className="hover:opacity-80">
              <Image
                src="/images/logoBA.png"
                alt="Logo Buenos Aires"
                width={100}
                height={40}
                priority
                className="mr-4"
              />
            </Link>
          </li>
          <li className="flex items-center">
            <Link href="/expedientes" className="hover:text-gray-300 text-lg font-medium">
              Expedientes
            </Link>
          </li>
          <li className="flex items-center">
            <Link href="/reportes" className="hover:text-gray-300 text-lg font-medium">
              Reportes
            </Link>
          </li>
          <li className="flex items-center relative">
            <Link href="/alertas" className="hover:text-gray-300 text-lg font-medium">
              Alertas
            </Link>
            {user.alerts > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {user.alerts}
              </span>
            )}
          </li>
          <li className="flex items-center">
            <Link href="/perfil" className="hover:text-gray-300 text-lg font-medium">
              Perfil
            </Link>
          </li>
        </ul>
        <div className="flex items-center space-x-6">
          <span className="text-lg">Bienvenido {user.name} {user.surname}</span>
          <button 
            onClick={handleLogout} 
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-lg"
          >
            Logout
          </button>
        </div>
        </>
      ) : (
        <>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:opacity-80">
              <Image
                src="/images/logoBA.png"
                alt="Logo Buenos Aires"
                width={100}  // Ajusta estos valores según el tamaño que necesites
                height={40}  // Ajusta estos valores según el tamaño que necesites
                priority     // Esto asegura que la imagen se cargue con prioridad al ser parte del menú
              />
            </Link>
          </li>
        </ul>
        <Link href="/login" className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
          Login
        </Link>
        </>
      )}
    </nav>
  );
};

export default Menu;
