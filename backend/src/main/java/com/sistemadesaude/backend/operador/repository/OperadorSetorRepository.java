package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorSetor;
import com.sistemadesaude.backend.operador.entity.key.OperadorSetorKey;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OperadorSetorRepository extends JpaRepository<OperadorSetor, OperadorSetorKey> {
    List<OperadorSetor> findByIdOperadorId(Long operadorId);
}
