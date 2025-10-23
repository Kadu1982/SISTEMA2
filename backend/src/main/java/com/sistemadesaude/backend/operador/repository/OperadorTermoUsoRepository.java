package com.sistemadesaude.backend.operador.repository;

import com.sistemadesaude.backend.operador.entity.OperadorTermoUso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório do Termo de Uso do Operador.
 *
 * Importante:
 * - Removemos métodos derivados que apontavam para atributos inexistentes (ex.: dataAceite).
 * - O service/controller já fazem filtro e ordenação em memória para evitar acoplamento
 *   com nomes de campos que podem variar entre projetos.
 *
 * Se a sua entidade tiver o campo de data chamado "aceitoEm" e você preferir ordenar no banco,
 * descomente o método sugerido abaixo e confirme que o nome da propriedade confere.
 */
@Repository
public interface OperadorTermoUsoRepository extends JpaRepository<OperadorTermoUso, Long> {

    /** Útil para checagem de duplicidade por versão (opcional no controller/service). */
    boolean existsByOperadorIdAndVersao(Long operadorId, String versao);

    /** Listagem simples por operador (o service ordena em memória). */
    List<OperadorTermoUso> findByOperadorId(Long operadorId);

    // >>> Se sua entidade tiver o campo "aceitoEm", e quiser ordenar no banco, use:
    // List<OperadorTermoUso> findByOperadorIdOrderByAceitoEmDesc(Long operadorId);
}
