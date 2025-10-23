
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface LayoutAgendamentoProps {
    title: string;
    subtitle?: string;
    isLoading?: boolean;
    errorMessage?: string;
    successMessage?: string;
    paciente?: {
        nome: string;
        cartaoSus?: string;
        dataNascimento?: string;
    };
    children: React.ReactNode;
}

// ✅ EXPORTAÇÃO DEFAULT
const LayoutAgendamento: React.FC<LayoutAgendamentoProps> = ({
                                                                 title,
                                                                 subtitle,
                                                                 isLoading = false,
                                                                 errorMessage,
                                                                 successMessage,
                                                                 paciente,
                                                                 children
                                                             }) => {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-gray-600">{subtitle}</p>
                )}
            </div>

            {/* Loading Indicator */}
            {isLoading && (
                <Alert className="border-blue-200 bg-blue-50">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        Processando agendamento...
                    </AlertDescription>
                </Alert>
            )}

            {/* Error Message */}
            {errorMessage && (
                <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Success Message */}
            {successMessage && (
                <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                        {successMessage}
                    </AlertDescription>
                </Alert>
            )}

            {/* Paciente Selecionado */}
            {paciente && (
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-blue-800 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Paciente Selecionado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">
                                    {paciente.nome}
                                </span>
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    Selecionado
                                </Badge>
                            </div>
                            {paciente.cartaoSus && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Cartão SUS:</span> {paciente.cartaoSus}
                                </p>
                            )}
                            {paciente.dataNascimento && (
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Data de Nascimento:</span> {' '}
                                    {new Date(paciente.dataNascimento).toLocaleDateString('pt-BR')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Conteúdo Principal */}
            {children}
        </div>
    );
};

export default LayoutAgendamento; // ✅ EXPORTAÇÃO DEFAULT