package com.sistemadesaude.backend.hospitalar.repository;

import com.sistemadesaude.backend.hospitalar.entity.ConfiguracaoHospitalar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConfiguracaoHospitalarRepository extends JpaRepository<ConfiguracaoHospitalar, Long> {

    Optional<ConfiguracaoHospitalar> findByParametroAndUnidadeId(String parametro, Long unidadeId);

    Optional<ConfiguracaoHospitalar> findByParametroAndUnidadeIdIsNull(String parametro);

    List<ConfiguracaoHospitalar> findByTipoAndAtivoTrue(ConfiguracaoHospitalar.TipoParametro tipo);

    List<ConfiguracaoHospitalar> findByUnidadeIdAndAtivoTrue(Long unidadeId);

    List<ConfiguracaoHospitalar> findByUnidadeIdIsNullAndAtivoTrue();

    @Query("SELECT c FROM ConfiguracaoHospitalar c WHERE c.parametro = :parametro AND (c.unidade.id = :unidadeId OR c.unidade.id IS NULL) ORDER BY c.unidade.id DESC")
    List<ConfiguracaoHospitalar> findByParametroWithFallback(@Param("parametro") String parametro, @Param("unidadeId") Long unidadeId);

    boolean existsByParametroAndUnidadeId(String parametro, Long unidadeId);
}