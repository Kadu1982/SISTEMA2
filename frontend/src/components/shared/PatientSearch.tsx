import React, { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for patients - in a real app, this would come from an API
const MOCK_PATIENTS = [
  { id: "1", name: "Carlos Eduardo dos Santos", cartaoSus: "708202666820449" },
  { id: "2", name: "Maria Aparecida Silva", cartaoSus: "701234567890123" },
  { id: "3", name: "João Paulo Oliveira", cartaoSus: "702345678901234" },
  { id: "4", name: "Ana Carolina Santos", cartaoSus: "703456789012345" },
  { id: "5", name: "Eduardo Carlos Pereira", cartaoSus: "704567890123456" },
  { id: "6", name: "Beatriz Santos Costa", cartaoSus: "705678901234567" },
  { id: "7", name: "Roberto Carlos Silva", cartaoSus: "706789012345678" },
  { id: "8", name: "Carolina Eduardo Ferreira", cartaoSus: "707890123456789" },
];

interface Patient {
  id: string;
  name: string;
  cartaoSus: string;
}

interface PatientSearchProps {
  onSelectPatient: (patient: Patient) => void;
  className?: string;
  placeholder?: string;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  onSelectPatient,
  className,
  placeholder = "Buscar paciente por nome...",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const lowercasedTerm = searchTerm.toLowerCase();
      const results = MOCK_PATIENTS.filter((patient) =>
        patient.name.toLowerCase().includes(lowercasedTerm),
      );
      setFilteredPatients(results);
      setOpen(true);
    } else {
      setFilteredPatients([]);
      setOpen(false);
    }
  }, [searchTerm]);

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
    setSearchTerm(patient.name);
    setOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      <Command className="rounded-lg border shadow-md">
        <CommandInput
          placeholder={placeholder}
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="h-10"
        />
        {open && (
          <CommandGroup className="max-h-64 overflow-auto">
            <CommandEmpty>Nenhum paciente encontrado.</CommandEmpty>
            {filteredPatients.map((patient) => (
              <CommandItem
                key={patient.id}
                value={patient.name}
                onSelect={() => handleSelect(patient)}
                className="flex justify-between py-3 px-2 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <User size={18} className="text-gray-500" />
                  <span>{patient.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  SUS: {patient.cartaoSus}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </Command>
    </div>
  );
};

export default PatientSearch;
