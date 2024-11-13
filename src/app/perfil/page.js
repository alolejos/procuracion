'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { clearUser, updateUser } from '@/store/userSlice';

export default function Perfil() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    surname: '',
    userTypeId: ''
  });
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const router = useRouter();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.user.token);
  const currentUser = useSelector((state) => state.user);
  console.log("CURRENT USER", currentUser);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar tipos de usuario
        const typesResponse = await axios.get('http://localhost:3001/api/user-types', {
          headers: { Authorization: `${token}` }
        });
        setUserTypes(typesResponse.data);

        console.log("USER TYPES devueltos: ", typesResponse.data);

        // Cargar datos del usuario
        const userResponse = await axios.get('http://localhost:3001/api/users/profile', {
          headers: { Authorization: `${token}` }
        });

        console.log("USER devueltos: ", userResponse.data);
        
        setFormData({
          username: userResponse.data.username,
          password: '', // No mostrar la contraseña actual
          name: userResponse.data.name,
          surname: userResponse.data.surname,
          userTypeId: userResponse.data.userTypeId
        });
      } catch (error) {
        if (error.response?.status === 403) {
          dispatch(clearUser());
          router.push('/login');
        }
        setError('Error al cargar los datos del perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setUpdating(true);
    console.log("FORM DATA", formData);
    try {
      // Solo enviar campos que han sido modificados
      const updateData = {};
      if (formData.password) updateData.password = formData.password;
      if (formData.name !== currentUser.name) updateData.name = formData.name;
      if (formData.surname !== currentUser.surname) updateData.surname = formData.surname;
      if (formData.userTypeId !== currentUser.userTypeId) updateData.userTypeId = formData.userTypeId;

      const response = await axios.put(
        'http://localhost:3001/api/users/profile',
        updateData,
        {
          headers: { Authorization: `${token}` }
        }
      );

      dispatch(updateUser(response.data));
      setSuccessMessage('Perfil actualizado correctamente');
      setFormData(prev => ({ ...prev, password: '' })); // Limpiar el campo de contraseña
    } catch (error) {
      setError(error.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Area
          </label>
          <select
            name="userTypeId"
            value={formData.userTypeId}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {userTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="username"
            value={formData.username}
            disabled
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nueva Contraseña
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Dejar en blanco para mantener la actual"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nombre
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Apellido
          </label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>


        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updating}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              updating ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {updating ? 'Actualizando...' : 'Actualizar Perfil'}
          </button>
        </div>
      </form>
    </div>
  );
}
