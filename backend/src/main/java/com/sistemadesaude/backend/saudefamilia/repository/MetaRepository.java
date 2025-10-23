package com.sistemadesaude.backend.saudefamilia.repository;

import com.sistemadesaude.backend.saudefamilia.entity.Meta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MetaRepository extends JpaRepository<Meta, Long> {
}
