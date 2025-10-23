
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, Users, Activity } from 'lucide-react';

const ControleViaturas: React.FC = () => {
    const viaturas = [
        {
            codigo: 'USA-01',
            tipo: 'USA',
            status: 'DISPONIVEL',
            equipe: ['Dr. João', 'Enf. Maria', 'Tec. Pedro'],
            localizacao: 'Base Central'
        },
        {
            codigo: 'USB-02',
            tipo: 'USB',
            status: 'EM_OCORRENCIA',
            equipe: ['Enf. Ana', 'Tec. Carlos'],
            localizacao: 'Rua das Flores, 123'
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DISPONIVEL': return 'bg-green-100 text-green-800';
            case 'EM_OCORRENCIA': return 'bg-red-100 text-red-800';
            case 'MANUTENCAO': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        Controle de Viaturas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {viaturas.map((viatura) => (
                            <Card key={viatura.codigo} className="border">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Car className="w-5 h-5" />
                                            <span className="font-bold">{viatura.codigo}</span>
                                            <Badge variant="outline">{viatura.tipo}</Badge>
                                        </div>
                                        <Badge className={getStatusColor(viatura.status)}>
                                            {viatura.status.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span>{viatura.localizacao}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <span>{viatura.equipe.join(', ')}</span>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex gap-2">
                                        <Button size="sm" variant="outline">
                                            Localizar
                                        </Button>
                                        <Button size="sm" variant="outline">
                                            Contatar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ControleViaturas;