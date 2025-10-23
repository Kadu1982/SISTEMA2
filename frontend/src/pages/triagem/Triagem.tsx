import React from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { TriagemPaciente } from "@/components/triagem/TriagemPaciente";

const Triagem = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">
        Acolhimento Ambulatorial
      </h1>

      <Card>
        <CardContent>
          <TriagemPaciente />
        </CardContent>
      </Card>
    </div>
  );
};

export default Triagem;