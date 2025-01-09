'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { clearUser } from '@/store/userSlice';

export default function ExpedienteDetalle() {
  const [expediente, setExpediente] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  
  useEffect(() => {
    const fetchExpedienteData = async () => {
      try {
        const expResponse = await axios.get(`http://15.229.87.106:3001/api/expedientes/${params.id}`, {
          headers: { 
            Authorization: `${token}` 
        }
        });
        setExpediente(expResponse.data);
        setArchivos(expResponse.data.Files);
      } catch (error) {
        if (error.response && error.response.status === 403) {
            //await showDialog('La sesión ha expirado. Ingrese nuevamente', 'error');    
            //router.push('/login'); // La redirección ocurre después de que el usuario confirma
            const userConfirmed = window.confirm('La sesión ha expirado. Ingrese nuevamente.');
            if (userConfirmed) {
                dispatch(clearUser());
                router.push('/login');
            }
        }else if (error.code === 'ERR_NETWORK') {
            alert('Error de conexión: No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.', 'error');
          } else {
            alert(`Error al cargar el archivo: ${error.message}`, 'error');
          }
      } finally {
        setLoading(false);
      }
    };

    fetchExpedienteData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Expediente {expediente?.numeroExpediente}</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Detalles</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Fuero</p>
            <p>{expediente?.fuero}</p>
          </div>
          <div>
            <p className="text-gray-600">Juzgado</p>
            <p>{expediente?.numeroJuzgado}</p>
          </div>
          <div>
            <p className="text-gray-600">Fecha:</p>
            <p>{new Date(expediente?.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Secretaría</p>
            <p>{expediente?.numeroSecretaria}</p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Archivos Asociados</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {archivos.map((archivo) => (
                <tr key={archivo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{archivo.realFileName}</td>
                  <td className="px-6 py-4">{new Date(archivo.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">{archivo.tipo}</td>
                  <td className="px-6 py-4">{archivo.resumen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 