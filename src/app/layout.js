'use client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '../store/store';
import "./globals.css";
import Menu from '../components/Menu';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
          <body
            className={`antialiased min-h-screen font-[family-name:var(--font-geist-sans)]`}
          >
            <Provider store={store}>
            <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
              <Menu />
              
              <main className="p-8">
              {children}
                
              </main>

              <footer className="mt-8 text-center text-gray-500 p-4">
                <p>&copy; 2023 Sistema de Procuración. Todos los derechos reservados.</p>
              </footer>

            </PersistGate>
            </Provider>
          </body>
    </html>
  );
}
