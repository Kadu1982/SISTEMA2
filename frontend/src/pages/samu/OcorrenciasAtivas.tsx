import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, Clock, MapPin, Phone, Car } from 'lucide-react';

const OcorrenciasAtivas: React.FC = () => {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Todas as Ocorrências Ativas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-gray-500">
                        <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma ocorrência ativa no momento</p>
                        <p className="text-sm mt-2">
                            As ocorrências em andamento aparecerão aqui
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default OcorrenciasAtivas;