
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stethoscope, User, Clock, AlertTriangle } from 'lucide-react';

const RegulacaoMedica: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="w-5 h-5" />
                        Regulação Médica - Ocorrências Pendentes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma ocorrência pendente de regulação médica</p>
                        <p className="text-sm mt-2">
                            As ocorrências que necessitam avaliação médica aparecerão aqui
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default RegulacaoMedica;