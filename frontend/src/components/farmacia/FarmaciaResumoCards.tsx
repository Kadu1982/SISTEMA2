import React, { useEffect, useState } from "react";
import { listarFarmacias } from "@/services/farmaciaService";
import { FarmaciaDTO } from "@/types/FarmaciaDTO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const FarmaciaResumoCards: React.FC = () => {
    const [farmacias, setFarmacias] = useState<FarmaciaDTO[]>([]);

    useEffect(() => {
        const carregarFarmacias = async () => {
            try {
                const dados = await listarFarmacias();
                setFarmacias(dados);
            } catch (error) {
                console.error("Erro ao carregar farmácias:", error);
            }
        };

        carregarFarmacias();
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {farmacias.map((farmacia) => (
                <Card key={farmacia.id}>
                    <CardHeader>
                        <CardTitle>{farmacia.nome}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>Responsável: {farmacia.responsavelTecnico}</p>
                        <p>Telefone: {farmacia.telefone}</p>
                        <p>ID da Unidade: {farmacia.unidadeSaudeId}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
