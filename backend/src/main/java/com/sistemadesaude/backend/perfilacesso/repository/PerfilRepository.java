package com.sistemadesaude.backend.perfilacesso.repository;

import com.sistemadesaude.backend.perfilacesso.entity.Perfil;
import com.sistemadesaude.backend.perfilacesso.entity.PerfilEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerfilRepository extends JpaRepository<PerfilEntity, Long> {

    /**
     * Busca perfil por tipo (enum)
     */
    Optional<PerfilEntity> findByTipo(Perfil tipo);

    /**
     * Verifica se existe perfil com tipo específico
     */
    boolean existsByTipo(Perfil tipo);

    /**
     * Busca por nome "oficial" (coluna nome)
     */
    Optional<PerfilEntity> findByNome(String nome);

    /**
     * Verifica se existe perfil com nome "oficial"
     */
    boolean existsByNome(String nome);

    /**
     * Busca por nome customizado
     */
    Optional<PerfilEntity> findByNomeCustomizado(String nomeCustomizado);

    /**
     * Verifica se existe perfil com nome customizado
     */
    boolean existsByNomeCustomizado(String nomeCustomizado);

    /**
     * Busca perfis ativos
     */
    List<PerfilEntity> findByAtivoTrueOrderByTipo();

    /**
     * Busca todos ordenados por nível (customizado ou derivado do enum) e por tipo.
     */
    @Query("SELECT p FROM PerfilEntity p ORDER BY " +
            "COALESCE(p.nivelCustomizado, " +
            "  CASE " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.ADMINISTRADOR_DO_SISTEMA THEN 1 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.GESTOR THEN 2 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.MEDICO THEN 3 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.ENFERMEIRO THEN 4 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.DENTISTA THEN 4 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.FARMACEUTICO THEN 5 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.TRIAGEM THEN 5 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.TECNICO_ENFERMAGEM THEN 6 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.TECNICO_HIGIENE_DENTAL THEN 6 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.RECEPCIONISTA THEN 7 " +
            "    WHEN p.tipo = com.sistemadesaude.backend.perfilacesso.entity.Perfil.USUARIO_SISTEMA THEN 8 " +
            "    ELSE 999 " +
            "  END" +
            "), " +
            "p.tipo")
    List<PerfilEntity> findAllOrderedByLevel();

    /**
     * Busca por termo (nome oficial, nome customizado ou descrição). Filtra somente ativos.
     */
    @Query("""
           SELECT p
             FROM PerfilEntity p
            WHERE p.ativo = true
              AND (
                    :termo IS NULL OR :termo = ''
                 OR UPPER(p.nome)            LIKE UPPER(CONCAT('%', :termo, '%'))
                 OR UPPER(p.nomeCustomizado) LIKE UPPER(CONCAT('%', :termo, '%'))
                 OR UPPER(p.descricao)       LIKE UPPER(CONCAT('%', :termo, '%'))
              )
            ORDER BY p.tipo
           """)
    List<PerfilEntity> searchByNomeOuDescricao(@Param("termo") String termo);
}
