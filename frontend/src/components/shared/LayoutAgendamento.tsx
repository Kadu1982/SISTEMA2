import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, User, AlertCircle } from 'lucide-react';

interface LayoutAgendamentoProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
    isLoading?: boolean;
    errorMessage?: string;
    paciente?: {
        nome: string;
        cartaoSus: string;
        dataNascimento: string;
    };
}

export const LayoutAgendamento: React.FC<LayoutAgendamentoProps> = ({
                                                                        title,
                                                                        subtitle,
                                                                        children,
                                                                        isLoading = false,
                                                                        errorMessage,
                                                                        paciente
                                                                    }) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-500">
            {new Date().toLocaleString('pt-BR')}
          </span>
                </div>
            </div>

            {/* Informações do Paciente */}
            {paciente && (
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Paciente Selecionado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Nome</p>
                                <p className="font-medium">{paciente.nome}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Cartão SUS</p>
                                <p className="font-medium">{paciente.cartaoSus}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Data de Nascimento</p>
                                <p className="font-medium">
                                    {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Mensagem de Erro */}
            {errorMessage && (
                <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 text-red-700">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Erro:</span>
                            <span>{errorMessage}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Conteúdo Principal */}
            <div className="relative">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span>Carregando...</span>
                        </div>
                    </div>
                )}
                {children}
            </div>
        </div>
    );
};