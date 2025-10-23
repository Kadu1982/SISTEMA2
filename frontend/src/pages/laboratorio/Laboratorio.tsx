import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Settings,
  TestTube,
  Microscope,
  FileText,
  ClipboardList,
  Package,
  UserCheck,
  Printer
} from 'lucide-react';
import ConfiguracaoLaboratorio from './configuracao/ConfiguracaoLaboratorio';
import ListaExames from './exames/ListaExames';
import FormExame from './exames/FormExame';
import ListaMateriais from './materiais/ListaMateriais';
import ListaGrupos from './grupos/ListaGrupos';
import RecepcaoExames from './recepcao/RecepcaoExames';
import ColetaMateriais from './coleta/ColetaMateriais';
import DigitacaoResultados from './resultados/DigitacaoResultados';
import EntregaExames from './entrega/EntregaExames';

const Laboratorio: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/laboratorio/configuracao', label: 'Configurações', icon: Settings },
    { path: '/laboratorio/exames', label: 'Exames', icon: Microscope },
    { path: '/laboratorio/materiais', label: 'Materiais', icon: TestTube },
    { path: '/laboratorio/grupos', label: 'Grupos', icon: Package },
    { path: '/laboratorio/recepcao', label: 'Recepção', icon: ClipboardList },
    { path: '/laboratorio/coleta', label: 'Coleta', icon: TestTube },
    { path: '/laboratorio/resultados', label: 'Resultados', icon: FileText },
    { path: '/laboratorio/entrega', label: 'Entrega', icon: UserCheck },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Microscope size={28} />
            Laboratório
          </h2>
        </div>
        <nav className="p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<DashboardLaboratorio />} />
          <Route path="configuracao" element={<ConfiguracaoLaboratorio />} />
          <Route path="exames" element={<ListaExames />} />
          <Route path="exames/novo" element={<FormExame />} />
          <Route path="exames/:id" element={<FormExame />} />
          <Route path="materiais" element={<ListaMateriais />} />
          <Route path="grupos" element={<ListaGrupos />} />
          <Route path="recepcao" element={<RecepcaoExames />} />
          <Route path="coleta" element={<ColetaMateriais />} />
          <Route path="resultados" element={<DigitacaoResultados />} />
          <Route path="entrega" element={<EntregaExames />} />
        </Routes>
      </main>
    </div>
  );
};

const DashboardLaboratorio: React.FC = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard do Laboratório</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Aguardando Coleta</p>
              <p className="text-3xl font-bold text-blue-600">12</p>
            </div>
            <ClipboardList size={40} className="text-blue-300" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Em Análise</p>
              <p className="text-3xl font-bold text-yellow-600">8</p>
            </div>
            <TestTube size={40} className="text-yellow-300" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pendentes Assinatura</p>
              <p className="text-3xl font-bold text-orange-600">5</p>
            </div>
            <FileText size={40} className="text-orange-300" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Prontos Entrega</p>
              <p className="text-3xl font-bold text-green-600">15</p>
            </div>
            <UserCheck size={40} className="text-green-300" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Últimas Recepções</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium">João Silva</p>
                <p className="text-sm text-gray-500">Hemograma completo</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Aguardando</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Exames Urgentes</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-red-50 rounded">
              <div>
                <p className="font-medium">Maria Santos</p>
                <p className="text-sm text-gray-500">PCR, Hemograma</p>
              </div>
              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">URGENTE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laboratorio;