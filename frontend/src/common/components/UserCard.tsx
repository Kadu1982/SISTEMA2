import React from "react";

type UserCardProps = {
  nome: string;
  cpf: string;
  cns: string;
  endereco: string;
  nomeMae: string;
};

const UserCard: React.FC<UserCardProps> = ({
  nome,
  cpf,
  cns,
  endereco,
  nomeMae,
}) => {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        margin: "10px 0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3>{nome}</h3>
      <p>
        <strong>CPF:</strong> {cpf}
      </p>
      <p>
        <strong>CNS:</strong> {cns}
      </p>
      <p>
        <strong>Endereço:</strong> {endereco}
      </p>
      <p>
        <strong>Nome da Mãe:</strong> {nomeMae}
      </p>
    </div>
  );
};

export default UserCard;
