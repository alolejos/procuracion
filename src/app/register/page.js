'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    surname: '',
    sectorId: '1', // Default user type
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3006/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('User registered successfully:', data);
      alert('Usuario registrado correctamente');
      // Redirect to login page after successful registration
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'An error occurred during registration');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white border border-black shadow-lg rounded-lg w-1/2 p-8">
        <h1 className="text-3xl font-bold mb-4 text-center">Registro</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block mb-1">Email</label>
            <input
              type="email"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="name" className="block mb-1">Nombre</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="surname" className="block mb-1">Apellido</label>
            <input
              type="text"
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="sectorId" className="block mb-1">Sector</label>
            <select
              id="sectorId"
              name="sectorId"
              value={formData.sectorId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            >
              <option value="1">Mesa de Entradas</option>
              <option value="2">Dirección 1</option>
              <option value="3">Dirección 2</option>
            </select>
          </div>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}
