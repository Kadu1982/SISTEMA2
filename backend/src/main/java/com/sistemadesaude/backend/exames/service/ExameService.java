package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.ExameDTO;
import com.sistemadesaude.backend.exames.entity.Exame;
import com.sistemadesaude.backend.exames.entity.GrupoExame;
import com.sistemadesaude.backend.exames.mapper.ExameMapper;
import com.sistemadesaude.backend.exames.repository.ExameRepository;
import com.sistemadesaude.backend.exames.repository.GrupoExameRepository;
import com.sistemadesaude.backend.exception.BusinessException;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExameService {

    private final ExameRepository exameRepository;
    private final GrupoExameRepository grupoExameRepository;
    private final ExameMapper exameMapper;

    @Transactional(readOnly = true)
    public List<ExameDTO> listarTodos() {
        List<Exame> exames = exameRepository.findAll();
        return exameMapper.toDTOList(exames);
    }

    @Transactional(readOnly = true)
    public List<ExameDTO> listarAtivos() {
        List<Exame> exames = exameRepository.findByAtivoTrue();
        return exameMapper.toDTOList(exames);
    }

    @Transactional(readOnly = true)
    public ExameDTO buscarPorId(Long id) {
        Exame exame = exameRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado"));
        return exameMapper.toDTO(exame);
    }

    @Transactional(readOnly = true)
    public ExameDTO buscarPorCodigo(String codigo) {
        Exame exame = exameRepository.findByCodigo(codigo)
            .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado"));
        return exameMapper.toDTO(exame);
    }

    @Transactional(readOnly = true)
    public List<ExameDTO> buscar(String termo) {
        List<Exame> exames = exameRepository.buscarPorTermo(termo);
        return exameMapper.toDTOList(exames);
    }

    @Transactional
    public ExameDTO criar(ExameDTO dto) {
        // Validar código único
        if (exameRepository.findByCodigo(dto.getCodigo()).isPresent()) {
            throw new BusinessException("Já existe um exame com o código: " + dto.getCodigo());
        }

        Exame exame = exameMapper.toEntity(dto);

        // Associar grupo se fornecido
        if (dto.getGrupoId() != null) {
            GrupoExame grupo = grupoExameRepository.findById(dto.getGrupoId())
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado"));
            exame.setGrupo(grupo);
        }

        exame = exameRepository.save(exame);
        return exameMapper.toDTO(exame);
    }

    @Transactional
    public ExameDTO atualizar(Long id, ExameDTO dto) {
        Exame exame = exameRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado"));

        // Validar código único (exceto o próprio exame)
        exameRepository.findByCodigo(dto.getCodigo()).ifPresent(e -> {
            if (!e.getId().equals(id)) {
                throw new BusinessException("Já existe outro exame com o código: " + dto.getCodigo());
            }
        });

        // Atualizar campos básicos
        exame.setCodigo(dto.getCodigo());
        exame.setNome(dto.getNome());
        exame.setNomeResumido(dto.getNomeResumido());
        exame.setSinonimo(dto.getSinonimo());
        exame.setCodigoSigtap(dto.getCodigoSigtap());
        exame.setCodigoTuss(dto.getCodigoTuss());
        exame.setAtivo(dto.getAtivo());

        // Atualizar grupo
        if (dto.getGrupoId() != null) {
            GrupoExame grupo = grupoExameRepository.findById(dto.getGrupoId())
                .orElseThrow(() -> new ResourceNotFoundException("Grupo não encontrado"));
            exame.setGrupo(grupo);
        } else {
            exame.setGrupo(null);
        }

        // Validações
        exame.setIdadeMinima(dto.getIdadeMinima());
        exame.setIdadeMaxima(dto.getIdadeMaxima());
        if (dto.getSexoPermitido() != null) {
            exame.setSexoPermitido(Exame.SexoPermitido.valueOf(dto.getSexoPermitido()));
        }
        exame.setDiasValidade(dto.getDiasValidade());

        // Agendamento
        exame.setPermiteAgendamento(dto.getPermiteAgendamento());
        exame.setExameUrgencia(dto.getExameUrgencia());
        exame.setTempoRealizacaoMinutos(dto.getTempoRealizacaoMinutos());
        exame.setQuantidadeSessoes(dto.getQuantidadeSessoes());
        exame.setOrientacoesPaciente(dto.getOrientacoesPaciente());
        exame.setPreparo(dto.getPreparo());

        // Digitação
        if (dto.getTipoDigitacao() != null) {
            exame.setTipoDigitacao(Exame.TipoDigitacao.valueOf(dto.getTipoDigitacao()));
        }
        exame.setModeloLaudo(dto.getModeloLaudo());
        exame.setUsarAssinaturaEletronica(dto.getUsarAssinaturaEletronica());

        // Faturamento
        exame.setValorParticular(dto.getValorParticular());
        exame.setValorSus(dto.getValorSus());
        if (dto.getTipoFaturamento() != null) {
            exame.setTipoFaturamento(Exame.TipoFaturamento.valueOf(dto.getTipoFaturamento()));
        }

        // Interfaceamento
        exame.setCodigoEquipamento(dto.getCodigoEquipamento());
        exame.setUsaInterfaceamento(dto.getUsaInterfaceamento());

        exame = exameRepository.save(exame);
        return exameMapper.toDTO(exame);
    }

    @Transactional
    public void deletar(Long id) {
        Exame exame = exameRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado"));
        exame.setAtivo(false);
        exameRepository.save(exame);
    }

    // Método interno para buscar entidade
    @Transactional(readOnly = true)
    public Exame buscarEntidadePorId(Long id) {
        return exameRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Exame não encontrado"));
    }
}