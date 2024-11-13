'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, updateAlerts } from '@/store/userSlice';


export default function Reportes() {
  const user = useSelector((state) => state.user);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = useSelector((state) => state.user.token);
  const sectorId = useSelector((state) => state.user.sectorId);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchAlertas = async () => {
      try {
        const response = await axios.get(`http://15.228.73.54:3001/api/alerts/sector/${sectorId}`, {
          headers: {
            Authorization: `${token}`
          }
        });
        console.log("LISTADO DE ALERTAS", response.data);
        setAlertas(response.data.alerts);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          const userConfirmed = window.confirm('La sesión ha expirado. Ingrese nuevamente.');
          if (userConfirmed) {
            dispatch(clearUser());
            router.push('/login');
          }
        } else if (error.code === 'ERR_NETWORK') {
          alert('Error de conexión: No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.');
          setAlertas([]);
        } else {
          alert('Error al cargar las alertas: ' + error.message);
          setAlertas([]);
        }
      } finally {
        setLoading(false);
      }
    };
    console.log("SECTOR ID", sectorId);

    console.log("token", token);
    if (sectorId) {
      fetchAlertas();
    }
  }, [sectorId, token]);

  // Actualizar el estado de la alerta a LEIDO cuando se hace click en descargar
  const handleDownload = async (alertaId) => {
    try {
      await axios.put(
        `http://15.228.73.54:3001/api/alerts/sector/${sectorId}`,
        { estado: 'LEIDO' },
        {
          headers: {
            Authorization: `${token}`
          }
        }
      );
      // Actualizar el estado local para reflejar el cambio
      setAlertas(alertas.map(alerta => 
        alerta.id === alertaId ? { ...alerta, estado: 'LEIDO' } : alerta
      ));
    } catch (error) {
      console.error('Error al actualizar el estado de la alerta:', error);
    }
  };

  // Agregar esta nueva función después de handleDownload
  const handleEstadoClick = async (alertaId) => {
    if (alertaId) {
      try {
        await axios.put(
          `http://15.228.73.54:3001/api/alerts/${alertaId}`,
          { estado: 'LEIDO' },
          {
            headers: {
              Authorization: `${token}`
            }
          }
        );
        // Actualizar el estado local
        setAlertas(alertas.map(alerta => 
          alerta.id === alertaId ? { ...alerta, estado: 'LEIDO' } : alerta
        ));
        // Actualizar el estado del usuario en el store
        dispatch(updateAlerts(user.alerts - 1));

      } catch (error) {
        console.error('Error al actualizar el estado:', error);
        alert('Error al actualizar el estado de la alerta ' + error.message);
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Alertas Automáticas</h1>
      
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expediente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resumen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {alertas.map((alerta) => (
                <tr key={alerta.id} className={`hover:bg-gray-50 ${alerta.estado === 'NOLEIDO' ? 'font-bold bg-blue-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">{alerta.expediente?.numeroExpediente}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{alerta.documento?.realFileName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {alerta.estado === 'NOLEIDO' ? (
                      <span 
                        onClick={() => handleEstadoClick(alerta.id)}
                        className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          bg-yellow-100 text-yellow-800 cursor-pointer hover:bg-yellow-200"
                      >
                        {alerta.estado}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        bg-green-100 text-green-800"
                      >
                        {alerta.estado}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(alerta.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-pre-line break-words max-w-md">
                    {alerta.resumen}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        handleDownload(alerta.id);
                        window.open(`http://15.228.73.54:3001/api/files/${alerta.fileId}/download`, '_blank');
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      Asignar Legajo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
