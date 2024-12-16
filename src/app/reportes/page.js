'use client';
import { useState, useEffect, useRef, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser } from '@/store/userSlice';
import Image from 'next/image';

// Componente para el informe
const InformeTemplate = forwardRef(({ reporte }, ref) => (
  <div ref={ref} className="absolute left-[-9999px]">
    <div className="bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Logo y título */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/images/logoBA.png"
            alt="Logo Buenos Aires"
            width={100}
            height={40}
            priority
            className="mb-4"
          />
          <h2 className="text-xl font-bold mb-2">Informe automatizado</h2>
          <p className="text-sm text-gray-600">
            Ciudad Autónoma de Buenos Aires, {new Date(reporte.createdAt).toLocaleDateString('es-AR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* Texto introductorio */}
        <p className="mb-6">
          A partir de la detección inteligente del documento analizado, se ha elaborado un informe
          automatizado con los datos del mismo:
        </p>

        {/* Datos del informe */}
        <div className="space-y-4">
          <div>
            <span className="font-semibold">Documento analizado: </span>
            <span>{reporte.file.tipo}</span>
          </div>

          <div>
            <span className="font-semibold">Expediente: </span>
            <span>{reporte.numeroExpediente}</span>
          </div>

          <div>
            <span className="font-semibold">CUIJ: </span>
            <span>{reporte.CUIJ || ''}</span>
          </div>

          <div>
            <span className="font-semibold">Tipo de acción: </span>
            <span>{reporte.tipoAccion || ''}</span>
          </div>

          <div>
            <span className="font-semibold">Objeto: </span>
            <span>{reporte.file.tipo === 'cedula' ? 'Informar al GCBA' : reporte.objeto}</span>
          </div>

          <div>
            <span className="font-semibold">Temática: </span>
            <span>{reporte.tematica || ''}</span>
          </div>

          <div>
            <span className="font-semibold">Criticidad: </span>
            <span>{reporte.criticidad || ''}</span>
          </div>

          <div>
            <span className="font-semibold">Instancia: </span>
            <span>{reporte.instancia || ''}</span>
          </div>

          <div>
            <span className="font-semibold">Fuero: </span>
            <span>{reporte.fuero || ''}</span>
          </div>

          <div>
            <span className="font-semibold">Rol del GCBA: </span>
            <span>{reporte.rolGCBA || 'actor/demandado'}</span>
          </div>

          <div>
            <span className="font-semibold">Resumen: </span>
            <span>{reporte.resumen || ''}</span>
          </div>

          <div>
            <span className="font-semibold">Fecha de ingreso de documento: </span>
            <span>{new Date(reporte.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
));

InformeTemplate.displayName = 'InformeTemplate';

export default function Reportes() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = useSelector((state) => state.user.token);
  const dispatch = useDispatch();
  const informeRefs = useRef({});

  useEffect(() => {
    const fetchReportes = async () => {
      try {
        const response = await axios.get('http://18.228.3.214:3001/api/reports', {
          headers: {
            Authorization: `${token}`
          }
        });
        setReportes(response.data);
        console.log("LISTADO REPORTES: ", response.data);
      } catch (error) {
        if (error.response && error.response.status === 403) {
          const userConfirmed = window.confirm('La sesión ha expirado. Ingrese nuevamente.');
          if (userConfirmed) {
            dispatch(clearUser());
            router.push('/login');
          }
        } else {
          alert('Error al cargar los reportes: ' + error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReportes();
  }, []);

  const generatePDF = async (reporte) => {
    const html2pdf = (await import('html2pdf.js')).default;
    
    const element = informeRefs.current[reporte.id];
    
    const opt = {
      margin: [0.5, 0.5],
      filename: `informe-${reporte.numeroExpediente}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Reportes Automáticos</h1>
      
      {loading ? (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expediente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Archivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temática</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resumen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportes.map((reporte) => (
                  <tr key={reporte.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">{reporte.numeroExpediente}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reporte.file.realfileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reporte.file.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{reporte.tematica}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(reporte.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-line break-words max-w-md">
                      {reporte.resumen}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => router.push(`/reportes/${reporte.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-4 flex items-center space-x-2"
                      >
                        <svg 
                          className="w-5 h-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                          />
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                          />
                        </svg>
                        <span>Ver reporte</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Templates ocultos para cada informe */}
          {reportes.map((reporte) => (
            <InformeTemplate
              key={reporte.id}
              reporte={reporte}
              ref={el => informeRefs.current[reporte.id] = el}
            />
          ))}
        </>
      )}
    </div>
  );
}
