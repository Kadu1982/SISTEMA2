package com.sistemadesaude.backend.hospitalar.service;

import com.sistemadesaude.backend.hospitalar.dto.ControleAcessoDTO;
import com.sistemadesaude.backend.hospitalar.dto.RegistrarAcessoRequest;
import com.sistemadesaude.backend.hospitalar.entity.ControleAcesso;
import com.sistemadesaude.backend.hospitalar.repository.ControleAcessoRepository;
import com.sistemadesaude.backend.response.ApiResponse;
import com.sistemadesaude.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ControleAcessoService {

    private final ControleAcessoRepository controleAcessoRepository;

    @Transactional
    public ApiResponse<ControleAcessoDTO> registrarEntrada(RegistrarAcessoRequest request) {
        try {
            log.info("Registrando entrada para: {} - {}", request.getNome(), request.getTipoVisitante());

            // Verificar se já existe entrada sem saída para a mesma pessoa no mesmo dia
            Optional<ControleAcesso> acessoAberto = controleAcessoRepository
                    .findByDocumentoAtivo(request.getDocumento());
            List<ControleAcesso> acessosAbertos = acessoAberto.map(List::of).orElse(List.of());

            if (!acessosAbertos.isEmpty()) {
                throw new BusinessException("Já existe uma entrada em aberto para este documento");
            }

            ControleAcesso controleAcesso = new ControleAcesso();
            controleAcesso.setNome(request.getNome());
            controleAcesso.setDocumento(request.getDocumento());
            controleAcesso.setTipoDocumento(ControleAcesso.TipoDocumento.valueOf(request.getTipoDocumento()));
            controleAcesso.setTipoVisitante(ControleAcesso.TipoVisitante.valueOf(request.getTipoVisitante()));
            // Nota: Campo unidadeId não existe na entidade, usando unidade como relacionamento
            controleAcesso.setSetorDestino(request.getSetorDestino());
            // Nota: Campo pacienteVisitadoId não existe, usando paciente como relacionamento
            // Nota: Campo motivoVisita não existe na entidade
            controleAcesso.setTelefone(request.getTelefone());
            // Nota: Campo email não existe na entidade
            controleAcesso.setEmpresaFornecedor(request.getEmpresaFornecedor());
            controleAcesso.setObservacoes(request.getObservacoes());
            controleAcesso.setDataEntrada(LocalDateTime.now());
            // Nota: Campo operadorEntradaId não existe na entidade
            controleAcesso.setStatus(ControleAcesso.StatusAcesso.DENTRO);

            // Gerar número do crachá
            controleAcesso.setNumeroCracha(gerarNumeroCracha());

            controleAcesso = controleAcessoRepository.save(controleAcesso);

            log.info("Entrada registrada com sucesso - Crachá: {}", controleAcesso.getNumeroCracha());
            return ApiResponse.success(convertToDTO(controleAcesso));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao registrar entrada: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao registrar entrada", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<ControleAcessoDTO> registrarSaida(Long controleAcessoId, Long operadorId, String observacoesSaida) {
        try {
            log.info("Registrando saída para controle: {}", controleAcessoId);

            ControleAcesso controleAcesso = controleAcessoRepository.findById(controleAcessoId)
                    .orElseThrow(() -> new BusinessException("Controle de acesso não encontrado"));

            if (controleAcesso.getDataSaida() != null) {
                throw new BusinessException("Saída já foi registrada para este acesso");
            }

            if (controleAcesso.getStatus() != ControleAcesso.StatusAcesso.DENTRO) {
                throw new BusinessException("Acesso não está ativo");
            }

            controleAcesso.setDataSaida(LocalDateTime.now());
            // Nota: Campo operadorSaidaId não existe na entidade
            // Nota: Campo observacoesSaida não existe, usando observacoes
            controleAcesso.setStatus(ControleAcesso.StatusAcesso.SAIU);

            // Calcular tempo de permanência
            long minutosPermanencia = java.time.Duration.between(
                    controleAcesso.getDataEntrada(),
                    controleAcesso.getDataSaida()
            ).toMinutes();
            // Nota: Campo tempoPermanencia não existe na entidade

            controleAcesso = controleAcessoRepository.save(controleAcesso);

            log.info("Saída registrada com sucesso - Tempo permanência: {} minutos", minutosPermanencia);
            return ApiResponse.success(convertToDTO(controleAcesso));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao registrar saída: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao registrar saída", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    @Transactional
    public ApiResponse<ControleAcessoDTO> bloquearAcesso(Long controleAcessoId, Long operadorId, String motivo) {
        try {
            log.info("Bloqueando acesso: {}", controleAcessoId);

            ControleAcesso controleAcesso = controleAcessoRepository.findById(controleAcessoId)
                    .orElseThrow(() -> new BusinessException("Controle de acesso não encontrado"));

            if (controleAcesso.getStatus() != ControleAcesso.StatusAcesso.DENTRO) {
                throw new BusinessException("Acesso não está ativo");
            }

            controleAcesso.setStatus(ControleAcesso.StatusAcesso.CANCELADO);
            // Nota: Campo dataBloqueio não existe na entidade
            // Nota: Campo operadorBloqueioId não existe na entidade
            // Nota: Campo motivoBloqueio não existe na entidade

            controleAcesso = controleAcessoRepository.save(controleAcesso);

            log.info("Acesso bloqueado com sucesso");
            return ApiResponse.success(convertToDTO(controleAcesso));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao bloquear acesso: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao bloquear acesso", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<List<ControleAcessoDTO>> listarAcessosAtivos(Long unidadeId) {
        try {
            List<ControleAcesso> acessos = controleAcessoRepository
                    .findPessoasDentroUnidade(unidadeId);

            List<ControleAcessoDTO> dtos = acessos.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos);

        } catch (Exception e) {
            log.error("Erro ao listar acessos ativos", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<List<ControleAcessoDTO>> listarAcessosPorPeriodo(LocalDateTime dataInicio, LocalDateTime dataFim, Long unidadeId) {
        try {
            List<ControleAcesso> acessos;
            if (unidadeId != null) {
                acessos = controleAcessoRepository
                        .findByUnidadeAndPeriodo(unidadeId, dataInicio, dataFim);
            } else {
                // Para busca global, usar query customizada
                acessos = controleAcessoRepository
                        .findByPeriodoEntrada(dataInicio, dataFim, org.springframework.data.domain.Pageable.unpaged()).getContent();
            }

            List<ControleAcessoDTO> dtos = acessos.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(dtos);

        } catch (Exception e) {
            log.error("Erro ao listar acessos por período", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<ControleAcessoDTO> buscarPorCracha(String numeroCracha) {
        try {
            List<ControleAcesso> controles = controleAcessoRepository
                    .findByNumeroCracha(numeroCracha);
            ControleAcesso controleAcesso = controles.stream()
                    .filter(ca -> "DENTRO".equals(ca.getStatus().name()))
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("Crachá não encontrado ou não está ativo"));

            return ApiResponse.success(convertToDTO(controleAcesso));

        } catch (BusinessException e) {
            log.error("Erro de negócio ao buscar por crachá: {}", e.getMessage());
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            log.error("Erro inesperado ao buscar por crachá", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    public ApiResponse<Map<String, Object>> obterEstatisticasAcesso(Long unidadeId, LocalDateTime dataInicio, LocalDateTime dataFim) {
        try {
            List<ControleAcesso> acessos;
            if (unidadeId != null) {
                acessos = controleAcessoRepository
                        .findByUnidadeAndPeriodo(unidadeId, dataInicio, dataFim);
            } else {
                acessos = controleAcessoRepository
                        .findByPeriodoEntrada(dataInicio, dataFim, org.springframework.data.domain.Pageable.unpaged()).getContent();
            }

            long totalAcessos = acessos.size();
            long acessosAtivos = acessos.stream()
                    .mapToLong(a -> a.getStatus() == ControleAcesso.StatusAcesso.DENTRO ? 1 : 0)
                    .sum();
            long acessosFinalizados = acessos.stream()
                    .mapToLong(a -> a.getStatus() == ControleAcesso.StatusAcesso.SAIU ? 1 : 0)
                    .sum();
            long acessosBloqueados = acessos.stream()
                    .mapToLong(a -> a.getStatus() == ControleAcesso.StatusAcesso.CANCELADO ? 1 : 0)
                    .sum();

            long visitantes = acessos.stream()
                    .mapToLong(a -> a.getTipoVisitante() == ControleAcesso.TipoVisitante.VISITANTE ? 1 : 0)
                    .sum();
            long acompanhantes = acessos.stream()
                    .mapToLong(a -> a.getTipoVisitante() == ControleAcesso.TipoVisitante.ACOMPANHANTE ? 1 : 0)
                    .sum();
            long fornecedores = acessos.stream()
                    .mapToLong(a -> a.getTipoVisitante() == ControleAcesso.TipoVisitante.FORNECEDOR ? 1 : 0)
                    .sum();

            // Nota: Campo tempoPermanencia não existe, calculando baseado nas datas
            double tempoMedioPermanencia = acessos.stream()
                    .filter(a -> a.getDataSaida() != null)
                    .mapToLong(a -> java.time.Duration.between(a.getDataEntrada(), a.getDataSaida()).toMinutes())
                    .average()
                    .orElse(0.0);

            Map<String, Object> estatisticas = Map.of(
                "totalAcessos", totalAcessos,
                "porStatus", Map.of(
                    "ativos", acessosAtivos,
                    "finalizados", acessosFinalizados,
                    "bloqueados", acessosBloqueados
                ),
                "porTipo", Map.of(
                    "visitantes", visitantes,
                    "acompanhantes", acompanhantes,
                    "fornecedores", fornecedores
                ),
                "tempoMedioPermanencia", Math.round(tempoMedioPermanencia * 100.0) / 100.0,
                "periodo", Map.of(
                    "inicio", dataInicio,
                    "fim", dataFim
                )
            );

            return ApiResponse.success(estatisticas);

        } catch (Exception e) {
            log.error("Erro ao obter estatísticas de acesso", e);
            return ApiResponse.error("Erro interno do servidor");
        }
    }

    private String gerarNumeroCracha() {
        // Gera um número único baseado em timestamp e sequencial
        long timestamp = System.currentTimeMillis();
        String numero = String.format("CR%d", timestamp % 1000000);

        // Verificar se já existe e ajustar se necessário
        while (!controleAcessoRepository.findByNumeroCracha(numero).isEmpty()) {
            timestamp++;
            numero = String.format("CR%d", timestamp % 1000000);
        }

        return numero;
    }

    private ControleAcessoDTO convertToDTO(ControleAcesso controleAcesso) {
        ControleAcessoDTO dto = new ControleAcessoDTO();
        dto.setId(controleAcesso.getId());
        dto.setNome(controleAcesso.getNome());
        dto.setDocumento(controleAcesso.getDocumento());
        dto.setTipoDocumento(controleAcesso.getTipoDocumento() != null ? controleAcesso.getTipoDocumento().name() : null);
        dto.setTipoVisitante(controleAcesso.getTipoVisitante() != null ? controleAcesso.getTipoVisitante().name() : null);
        dto.setPacienteId(controleAcesso.getPaciente() != null ? controleAcesso.getPaciente().getId() : null);
        dto.setGrauParentesco(controleAcesso.getGrauParentesco());
        dto.setTelefone(controleAcesso.getTelefone());
        dto.setEmpresaFornecedor(controleAcesso.getEmpresaFornecedor());
        dto.setSetorDestino(controleAcesso.getSetorDestino());
        dto.setResponsavelLiberacaoId(controleAcesso.getResponsavelLiberacao() != null ? controleAcesso.getResponsavelLiberacao().getId() : null);
        dto.setDataEntrada(controleAcesso.getDataEntrada());
        dto.setDataSaida(controleAcesso.getDataSaida());
        dto.setObservacoes(controleAcesso.getObservacoes());
        dto.setNumeroCracha(controleAcesso.getNumeroCracha());
        dto.setFotoPath(controleAcesso.getFotoPath());
        dto.setStatus(controleAcesso.getStatus() != null ? controleAcesso.getStatus().name() : null);
        dto.setUnidadeId(controleAcesso.getUnidade() != null ? controleAcesso.getUnidade().getId() : null);

        // Campos auxiliares para exibição
        dto.setNomePaciente(controleAcesso.getPaciente() != null ? controleAcesso.getPaciente().getNomeCompleto() : null);
        dto.setNomeResponsavelLiberacao(controleAcesso.getResponsavelLiberacao() != null ? controleAcesso.getResponsavelLiberacao().getNome() : null);
        dto.setNomeUnidade(controleAcesso.getUnidade() != null ? controleAcesso.getUnidade().getNome() : null);
        dto.setTipoDocumentoDescricao(controleAcesso.getTipoDocumento() != null ? getTipoDocumentoDescricao(controleAcesso.getTipoDocumento()) : null);
        dto.setTipoVisitanteDescricao(controleAcesso.getTipoVisitante() != null ? getTipoVisitanteDescricao(controleAcesso.getTipoVisitante()) : null);
        dto.setStatusDescricao(controleAcesso.getStatus() != null ? getStatusDescricao(controleAcesso.getStatus()) : null);
        dto.setTempoPermancencia(calcularTempoPermanencia(controleAcesso));
        dto.setDataEntradaFormatada(controleAcesso.getDataEntrada() != null ? controleAcesso.getDataEntrada().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : null);
        dto.setDataSaidaFormatada(controleAcesso.getDataSaida() != null ? controleAcesso.getDataSaida().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")) : null);

        return dto;
    }

    private String getTipoDocumentoDescricao(ControleAcesso.TipoDocumento tipo) {
        switch (tipo) {
            case CPF: return "CPF";
            case RG: return "RG";
            case CNH: return "Carteira de Motorista";
            case PASSAPORTE: return "Passaporte";
            default: return tipo.name();
        }
    }

    private String getTipoVisitanteDescricao(ControleAcesso.TipoVisitante tipo) {
        switch (tipo) {
            case VISITANTE: return "Visitante";
            case ACOMPANHANTE: return "Acompanhante";
            case FORNECEDOR: return "Fornecedor";
            case PRESTADOR_SERVICO: return "Prestador de Serviço";
            case PACIENTE: return "Paciente";
            default: return tipo.name();
        }
    }

    private String getStatusDescricao(ControleAcesso.StatusAcesso status) {
        switch (status) {
            case DENTRO: return "Dentro da Unidade";
            case SAIU: return "Saída Registrada";
            case CANCELADO: return "Acesso Cancelado";
            default: return status.name();
        }
    }

    private String calcularTempoPermanencia(ControleAcesso controleAcesso) {
        if (controleAcesso.getDataEntrada() == null) return null;

        LocalDateTime dataFim = controleAcesso.getDataSaida() != null ?
                controleAcesso.getDataSaida() : LocalDateTime.now();

        long minutos = java.time.Duration.between(
                controleAcesso.getDataEntrada(), dataFim
        ).toMinutes();

        if (minutos < 60) return minutos + " min";
        long horas = minutos / 60;
        long minutosRestantes = minutos % 60;
        return horas + "h " + minutosRestantes + "min";
    }
}