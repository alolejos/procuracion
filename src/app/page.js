'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '../store/userSlice';
import { useRouter } from 'next/navigation';

export default function Home() {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!user.token) {
      router.push('/login');
    }
  }, [user.token, router]);

  const handleLogout = () => {
    dispatch(clearUser());
    router.push('/login');
  };

  if (!user.token) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-center">Procuración</h1>
        
        {user.name && <p>Welcome, {user.name} {user.surname}!</p>}
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/mesa-de-entradas">
            <button className="bg-white text-black border border-gray-300 p-4 rounded-[50px] shadow-md hover:bg-gray-100 transition w-full h-20">
              Mesa de Entradas
            </button>
          </Link>
          <button className="bg-white text-black border border-gray-300 p-4 rounded-[50px] shadow-md hover:bg-gray-100 transition w-full h-20">
            Mandatarios
          </button>
          <button className="bg-white text-black border border-gray-300 p-4 rounded-[50px] shadow-md hover:bg-gray-100 transition w-full h-20">
            Dictámenes
          </button>
          <button className="bg-white text-black border border-gray-300 p-4 rounded-[50px] shadow-md hover:bg-gray-100 transition w-full h-20">
            SiSej
          </button>
          <button className="bg-white text-black border border-gray-300 p-4 rounded-[50px] shadow-md hover:bg-gray-100 transition w-full h-20">
            Repositorio de Expedientes
          </button>
          <button className="bg-white text-black border border-gray-300 p-4 rounded-[50px] shadow-md hover:bg-gray-100 transition w-full h-20">
            Expedientes
          </button>
        </div>
        
        <button onClick={handleLogout} className="mt-4 bg-red-500 text-white p-2 rounded">
          Logout
        </button>
      </main>

      <footer className="mt-8 text-center text-gray-500 p-4">
        <p>&copy; 2023 Sistema de Procuración. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
