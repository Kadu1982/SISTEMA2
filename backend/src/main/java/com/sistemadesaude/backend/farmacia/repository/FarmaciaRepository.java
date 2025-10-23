// src/main/java/com/sistemadesaude/backend/repository/FarmaciaRepository.java

package com.sistemadesaude.backend.farmacia.repository;

import com.sistemadesaude.backend.farmacia.entity.Farmacia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmaciaRepository extends JpaRepository<Farmacia, Long> {
}
