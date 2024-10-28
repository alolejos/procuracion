'use client';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

export default function MesaDeEntradas() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleLoadDocuments = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
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
      const response = await axios.post('http://15.228.73.54:3001/api/files/generate-presigned-url', {
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

      console.log('File uploaded successfully:', uploadResponse);
      alert('File uploaded successfully');

      // Enviamos al endpoint de la API para que se guarde en la base de datos los datos del archivo
      const response1 = await axios.post('http://15.228.73.54:3001/api/files/save-file-data', {
        fileName: fileName,
        realFileName: realFileName,
        fileType: fileType,
      }, {
        headers: {
          Authorization: `${token}`,
        },
      });

      console.log('RESPONSE DEL SAVE FILE DATA:', response1);

      alert('File data saved successfully');
    } catch (error) {
      console.error('Error:', error);
      alert('Error uploading file: ' + (error.response ? error.response.data : error.message));
    } finally {
      setLoading(false);
    }
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
      <h1 className="text-3xl font-bold mb-4">Documentos</h1>
      <h2 className="text-xl text-gray-600 mb-8">Bienvenido al Sistema de Documentos</h2>
      <input type="file" onChange={handleFileChange} className="mb-4" disabled={loading} />
      <button
        onClick={handleLoadDocuments}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        disabled={loading}
      >
        Cargar Documentación
      </button>
    </div>
  );
}
