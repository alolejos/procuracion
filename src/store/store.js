// store.js
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Esto usa localStorage
import userReducer from './userSlice';

const persistConfig = {
  key: 'root',
  storage,
  // Puedes usar blacklist o whitelist para controlar qué parte del estado se persiste
  // blacklist: ['loading', 'error'], // Ejemplo de exclusión de valores no serializables
};

const persistedReducer = persistReducer(persistConfig, userReducer);

export const store = configureStore({
  reducer: {
    user: persistedReducer,
  },
});

// Crear el persistor
export const persistor = persistStore(store);
