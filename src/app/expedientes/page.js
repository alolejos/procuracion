'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '@/store/userSlice'; 

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const response = await axios.get('http://localhost:3006/api/expedientes/', {
          headers: {
            Authorization: `${token}`
          }
        });
        //console.log("LISTADO DE EXPEDIENTES", response.data);
        setExpedientes(response.data);
      } catch (error) {        
        //await showDialog('La sesión ha expirado. Ingrese nuevamente', 'error');    
        //router.push('/login'); // La redirección ocurre después de que el usuario confirma
        const userConfirmed = window.confirm('La sesión ha expirado. Ingrese nuevamente.');
        if (userConfirmed) {
          dispatch(clearUser());
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExpedientes();
  }, [token]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Repositorio Automático de Expedientes</h1>
      
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fuero</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Juzgado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secretaría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expedientes.map((expediente) => (
                <tr key={expediente.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <a
                      href={`/expedientes/${expediente.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {expediente.numeroExpediente}
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{expediente.fuero}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{expediente.numeroJuzgado}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{expediente.numeroSecretaria}</td>
                  <td className="px-6 py-4">{expediente.createdAt == null ? '' : new Date(expediente.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
