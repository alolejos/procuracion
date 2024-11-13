'use client';
import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { clearUser, updateAlerts } from '@/store/userSlice';
import Image from 'next/image';

export default function MesaDeEntradas() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const user = useSelector((state) => state.user);
  const router = useRouter();
  const [mlData, setMlData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [dialogType, setDialogType] = useState('info'); // 'info', 'error', 'success'
  const [dialogCallback, setDialogCallback] = useState(null);
  const informeRef = useRef(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const showDialog = (message, type = 'info', callback = null) => {
    return new Promise((resolve) => {
      setDialogMessage(message);
      setDialogType(type);
      setDialogOpen(true);
    });
  };

  const handleLoadDocuments = async () => {
    if (!selectedFile) {
      showDialog('Por favor seleccione un archivo.', 'error');
      return;
    }

    setLoading(true);

    try {

      // PRIMERO VAMOS A GENERAR UN NOMBRE UNICO PARA EL ARCHIVO MEDIANTE UN HASH
      const uniqueFileName = `${Date.now()}-${selectedFile.name}`;
      // Para mejor comprension definimos en variables: el nombre único del archivo, el nombre del archivo y el tipo de archivo
      const fileName = uniqueFileName;
      const realFileName = selectedFile.name;
      const fileType = selectedFile.type;

      // Solicitar la URL prefirmada
      const response = await axios.post('http://localhost:3001/api/files/generate-presigned-url', {
        fileName: fileName,
        fileType: fileType,
      }, {
        headers: {
          Authorization: `${token}`,
        },
      });

      const { url } = response.data; // Obtener la URL prefirmada

      // Subir el archivo a S3 usando la URL prefirmada
      const uploadResponse = await axios.put(url, selectedFile, {
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      // Enviamos al endpoint de la API para que se guarde en la base de datos los datos del archivo
      const response1 = await axios.post('http://localhost:3001/api/files/save-file-data', {
        fileName: fileName,
        realFileName: realFileName,
        fileType: fileType,
      }, {
        headers: {
          Authorization: `${token}`,
        },
      });

      const fileId = response1.data.file.id;

      showDialog('Datos del archivo guardados correctamente. Procesando...', 'info');

//      const responseML = await axios.post('http://15.228.73.54:5000/detect_file', {
//        fileName: fileName,
//        realFileName: realFileName,
//        fileType: fileType,
//      });

      // ENVIAMOS EL ARCHIVO AL SERVIDOR DE ML
      const responseML = await fetch('http://15.228.73.54:5000/detect_file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: fileName
        })
      });

      if (!responseML.ok) {
        throw new Error(`HTTP error! status: ${responseML.status}`);
      }

      const data = await responseML.json();
      await new Promise(resolve => setTimeout(resolve, 3000));

      showDialog('Archivo analizado correctamente', 'success');

      console.log("DATOS DEL ML SERVICE: ", data);
      
      // GUARDAMOS EL REPORTE EN LA BASE DE DATOS
      const reportResponse = await axios.post(
        'http://localhost:3001/api/reports/create',
        {
          fileData: data,
          fileId: fileId
        },
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // ACTUALIZAMOS EL ESTADO DEL ARCHIVO EN LA BASE DE DATOS
      const updateFile = await axios.put(
        `http://localhost:3001/api/files/update/${fileId}`,
        {
          mlData: data,
          status: 'PROCESSED' // O cualquier otro estado que necesites
        },
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMlData(data); // Guardar los datos en el estado
      console.log('RESPONSE DE UPDATEFILE', updateFile);

      // CUANDO RECIBIMOS EL RESPONSE en updateFile, analizamos la respuesta. 
      //       message: 'Archivo actualizado exitosamente',
      //       expediente,
      //       newExpediente
      //  Lo que tenemos que hacer ahora es crear una nueva alerta en la base de datos
      // La alerta debe tener los siguientes datos:
      // resumen = mlData.resumen
      // estado = 'NOLEIDO'
      // sectorId = newExpediente ? expediente.id : 1
      // expedienteId = expediente.id
      // fileId = fileId
      // userId = user.id
      const alertResponse = await axios.post(
        'http://localhost:3001/api/alerts/',
        {
          resumen: data[data.tipo].Resumen,
          sectorId: updateFile.data.newExpediente ? 1 : updateFile.data.expediente.sectorId,
          expedienteId: updateFile.data.expediente.id,
          fileId: fileId,
          userId: user.id
        },
        {
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      dispatch(updateAlerts(user.alerts + 1));

    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.status === 403) {
        //await showDialog('La sesión ha expirado. Ingrese nuevamente', 'error');    
        //router.push('/login'); // La redirección ocurre después de que el usuario confirma
        const userConfirmed = window.confirm('La sesión ha expirado. Ingrese nuevamente.');
        if (userConfirmed) {
          dispatch(clearUser());
          router.push('/login');
        }
      } else if (error.code === 'ERR_NETWORK') {
        await showDialog('Error de conexión: No se pudo conectar con el servidor. Por favor, verifique su conexión a internet.', 'error');
      } else {
        await showDialog(`Error al cargar el archivo: ${error.message}`, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  
  const generatePDF = async (reporte) => {
    const html2pdf = (await import('html2pdf.js')).default;

    const element = informeRef.current;
    const opt = {
      margin: 1,
      filename: 'informe-automatizado.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="p-8 relative">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-4">Detección Inteligente de Documentos</h1>
      <h2 className="text-xl text-gray-600 mb-8">Bienvenido al Sistema de Detección Inteligente de Documentos</h2>
      
      {/* Sección de carga de documentos */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Cargar nuevo documento</h3>
        <input 
          type="file" 
          onChange={handleFileChange} 
          className="mb-4 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          disabled={loading} 
        />
        <button
          onClick={handleLoadDocuments}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          Cargar Documentación
        </button>
      </div>

      {/* Informe section */}
      {mlData && (
        <>
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
                  Ciudad Autónoma de Buenos Aires, {new Date().toLocaleDateString('es-AR', {
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
                  <span>{mlData?.tipo || 'Cédula/oficio/No se ha detectatado que el documento es una cédula u oficio'}</span>
                </div>

                <div>
                  <span className="font-semibold">CUIJ: </span>
                  <span>{mlData?.[mlData.tipo]?.CUIJ || ''}</span>
                </div>

                <div>
                  <span className="font-semibold">Tipo de acción: </span>
                  <span>{mlData?.[mlData.tipo]?.TipoDeAccion || ''}</span>
                </div>

                <div>
                  <span className="font-semibold">Objeto: </span>
                  <span>{mlData?.tipo == 'cedula' ? 'Informar al GCBA' : mlData?.[mlData.tipo]?.objeto}</span>
                </div>

                <div>
                  <span className="font-semibold">Temática: </span>
                  <span>{mlData?.[mlData.tipo]?.Tematica || ''}</span>
                </div>

                <div>
                  <span className="font-semibold">Criticidad: </span>
                  <span>{mlData?.[mlData.tipo]?.Criticidad || ''}</span>
                </div>

                <div>
                  <span className="font-semibold">Instancia: </span>
                  <span>{mlData?.[mlData.tipo]?.Instancia || ''}</span>
                </div>

                <div>
                  <span className="font-semibold">Fuero: </span>
                  <span>{mlData?.[mlData.tipo]?.Fuero || ''}</span>
                </div>

                <div>
                  <span className="font-semibold">Rol del GCBA: </span>
                  <span>{mlData?.rolGCBA || 'actor/demandado'}</span>
                </div>

                <div>
                  <span className="font-semibold">Resumen: </span>
                  <span>{mlData?.[mlData.tipo]?.Resumen || ''}</span>
                </div>

                <div>
                  <span className="font-semibold">Fecha de ingreso de documento: </span>
                  <span>{mlData?.fechaIngreso || ''}</span>
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
        </>
      )}

      {/* Dialog Component */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className={`mb-4 ${
              dialogType === 'error' ? 'text-red-600' :
              dialogType === 'success' ? 'text-green-600' :
              'text-blue-600'
            }`}>
              {dialogType === 'error' && (
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {dialogType === 'success' && (
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {dialogType === 'info' && (
                <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-gray-700 mb-4">{dialogMessage}</p>
            <button
              onClick={() => {
                setDialogOpen(false);
              }}
              className={`w-full py-2 px-4 rounded ${
                dialogType === 'error' ? 'bg-red-600 hover:bg-red-700' :
                dialogType === 'success' ? 'bg-green-600 hover:bg-green-700' :
                'bg-blue-600 hover:bg-blue-700'
              } text-white transition-colors`}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
