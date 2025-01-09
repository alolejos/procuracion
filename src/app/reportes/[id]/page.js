'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSelector } from 'react-redux';
import html2pdf from 'html2pdf.js';
import Image from 'next/image';

export default function VerReporte({ params }) {
  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const token = useSelector((state) => state.user.token);
  const informeRef = useRef(null);

  useEffect(() => {
    const fetchReporte = async () => {
      try {
        const response = await axios.get(`http://15.229.87.106:3001/api/reports/${params.id}`, {
          headers: {
            Authorization: `${token}`
          }
        });
        setReporte(response.data);
        console.log("DATOS DEL REPORTE: ", response.data);
      } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar el reporte');
      } finally {
        setLoading(false);
      }
    };

    fetchReporte();
  }, [params.id, token]);

  const generatePDF = () => {
    const element = informeRef.current;
    const opt = {
      margin: 1,
      filename: `informe-${reporte.numeroExpediente}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Botón Volver mejorado */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="font-medium">Volver</span>
        </button>
      </div>

      <div ref={informeRef} className="bg-white rounded-lg shadow-lg p-6">
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
              <span className="font-semibold">CUIJ: </span>
              <span>{reporte.numeroExpediente || ''}</span>
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
              <span>{reporte.rolGcba || 'actor/demandado'}</span>
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

      {/* Botón de descarga */}
      <div className="flex justify-center mt-6">
        <button
          onClick={generatePDF}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md flex items-center space-x-2"
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <span>Descargar PDF</span>
        </button>
      </div>
    </div>
  );
} 