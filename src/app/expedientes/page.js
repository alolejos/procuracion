'use client';
import { useState, useEffect } from 'react';

export default function Expedientes() {
  const [expedientes, setExpedientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        const data = await response.json();
        console.log('que recibimos:', data);

        // Convert the JSON object to an array of expedientes
        const expedientesArray = data.map((country, index) => ({
          id: index,
          name: country.name.common,
          capital: country.capital, // Example field, adjust as needed
        }));

        setExpedientes(expedientesArray);
      } catch (error) {
        console.error('Error fetching expedientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpedientes();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Expedientes</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="list-disc pl-5">
          {expedientes.map((expediente) => (
            <li key={expediente.id} className="mb-2">
              {expediente.name} - {expediente.capital}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
