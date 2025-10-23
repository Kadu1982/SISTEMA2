import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Syringe, FileText, Shield, Settings } from 'lucide-react';
import AplicacaoVacinas from './aplicacoes/AplicacaoVacinas';
import CartaoVacinacao from './aplicacoes/CartaoVacinacao';
import ListaVacinas from './vacinas/ListaVacinas';

const Imunizacao: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/imunizacao/aplicacoes', label: 'Aplicar Vacinas', icon: Syringe },
    { path: '/imunizacao/cartao', label: 'Cartão de Vacinação', icon: Shield },
    { path: '/imunizacao/vacinas', label: 'Cadastro de Vacinas', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Syringe className="text-green-600" />
            Imunização
          </h2>
          <p className="text-sm text-gray-600 mt-1">Sistema de Vacinas</p>
        </div>

        <nav className="px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors
                  ${
                    isActive
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="aplicacoes" element={<AplicacaoVacinas />} />
          <Route path="cartao" element={<CartaoVacinacao />} />
          <Route path="vacinas" element={<ListaVacinas />} />
          <Route
            path="*"
            element={
              <div className="p-8 flex items-center justify-center min-h-full">
                <div className="bg-white rounded-lg shadow p-8 text-center max-w-4xl">
                  {/* Animação oficial do Zé Gotinha do Ministério da Saúde */}
                  <div className="mb-8 flex justify-center">
                    <img 
                      src="/ze-gotinha-oficial.gif" 
                      alt="Zé Gotinha - Vacina sempre Brasil"
                      className="max-w-full h-auto"
                      style={{ maxHeight: '400px' }}
                      onError={(e) => {
                        // Fallback para uma imagem estática caso o GIF não carregue
                        e.currentTarget.src = '/logo-conecta.png';
                        e.currentTarget.alt = 'Sistema de Imunização';
                      }}
                    />
                  </div>
                  <h2 className="text-3xl font-bold mb-4 text-green-700">Módulo de Imunização</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Sistema de gerenciamento de vacinas e aplicações
                  </p>
                  <div className="text-sm text-gray-500">
                    <p>Use o menu lateral para acessar as funcionalidades do sistema</p>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default Imunizacao;
