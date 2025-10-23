package com.sistemadesaude.backend.perfilacesso.service;

import com.sistemadesaude.backend.perfilacesso.dto.PerfilDTO;
import com.sistemadesaude.backend.perfilacesso.mapper.PerfilMapper; // Import correto
import com.sistemadesaude.backend.perfilacesso.entity.Perfil;
import com.sistemadesaude.backend.perfilacesso.entity.PerfilEntity;
import com.sistemadesaude.backend.perfilacesso.repository.PerfilRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementação do serviço de perfis de acesso
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PerfilServiceImpl implements PerfilService {

    private final PerfilRepository perfilRepository;
    private final PerfilMapper perfilMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PerfilDTO> listarTodos() {
        log.debug("Listando todos os perfis");
        return perfilRepository.findAllOrderedByLevel()
                .stream()
                .map(perfilMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PerfilDTO> buscarPorId(Long id) {
        log.debug("Buscando perfil pelo ID: {}", id);
        return perfilRepository.findById(id)
                .map(perfilMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PerfilDTO> buscarPorNome(String nome) {
        log.debug("Buscando perfil pelo nome: {}", nome);
        return perfilRepository.findByNome(nome)
                .map(perfilMapper::toDTO);
    }

    @Override
    public PerfilDTO criar(PerfilDTO perfilDTO) throws IllegalArgumentException {
        log.debug("Criando perfil: {}", perfilDTO);

        // Verificar conflito por tipo (quando informado)
        if (perfilDTO.getTipo() != null && perfilRepository.existsByTipo(perfilDTO.getTipo())) {
            throw new IllegalArgumentException("Já existe um perfil com o tipo: " + perfilDTO.getTipo());
        }

        // Verificar conflito por nome customizado (quando informado)
        if (perfilDTO.getNomeCustomizado() != null &&
                perfilRepository.existsByNomeCustomizado(perfilDTO.getNomeCustomizado())) {
            throw new IllegalArgumentException("Já existe um perfil com o nome: " + perfilDTO.getNomeCustomizado());
        }

        // Auditoria
        String usuarioAtual = getUsuarioAtual();
        if (perfilDTO.getCriadoPor() == null) {
            perfilDTO.setCriadoPor(usuarioAtual);
        }
        perfilDTO.setAtualizadoPor(usuarioAtual);

        // Converte para entidade
        PerfilEntity perfil = perfilMapper.toEntity(perfilDTO);

        // Garantir 'tipo' não-nulo: tenta usar do DTO; se não houver, inferir pelo nome; se não, padrão USER
        if (perfil.getTipo() == null) {
            Perfil inferido = inferirTipoPorNome(
                    perfilDTO.getNomeCustomizado() != null ? perfilDTO.getNomeCustomizado() : perfilDTO.getNome());
            perfil.setTipo(inferido != null ? inferido : Perfil.USUARIO_SISTEMA);
        }

        // Garantir ativo/sistemaPerfil não-nulos (em geral a entidade já possui defaults)
        if (perfil.getAtivo() == null) perfil.setAtivo(true);
        if (perfil.getSistemaPerfil() == null) perfil.setSistemaPerfil(false);

        PerfilEntity perfilSalvo = perfilRepository.save(perfil);
        return perfilMapper.toDTO(perfilSalvo);
    }

    @Override
    public PerfilDTO atualizar(Long id, PerfilDTO perfilDTO) throws EntityNotFoundException, IllegalArgumentException {
        log.debug("Atualizando perfil com ID: {}", id);

        PerfilEntity perfilExistente = perfilRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Perfil não encontrado com o ID: " + id));

        // Proíbe renomear perfis de sistema
        if (Boolean.TRUE.equals(perfilExistente.getSistemaPerfil()) &&
                perfilDTO.getNomeCustomizado() != null &&
                !Objects.equals(perfilExistente.getNomeCustomizado(), perfilDTO.getNomeCustomizado())) {
            throw new IllegalArgumentException("Não é permitido alterar o nome de um perfil de sistema");
        }

        // Verifica conflito de nome customizado
        if (perfilDTO.getNomeCustomizado() != null &&
                !Objects.equals(perfilExistente.getNomeCustomizado(), perfilDTO.getNomeCustomizado()) &&
                perfilRepository.existsByNomeCustomizado(perfilDTO.getNomeCustomizado())) {
            throw new IllegalArgumentException("Já existe um perfil com o nome: " + perfilDTO.getNomeCustomizado());
        }

        // Auditoria
        String usuarioAtual = getUsuarioAtual();
        perfilDTO.setAtualizadoPor(usuarioAtual);

        // Atualiza a entidade com os dados do DTO
        perfilMapper.updateEntityFromDTO(perfilExistente, perfilDTO);

        // Se 'tipo' ainda estiver nulo (ou foi zerado), tenta inferir/atribuir padrão
        if (perfilExistente.getTipo() == null) {
            Perfil inferido = inferirTipoPorNome(
                    perfilDTO.getNomeCustomizado() != null ? perfilDTO.getNomeCustomizado() : perfilDTO.getNome());
            perfilExistente.setTipo(inferido != null ? inferido : Perfil.USUARIO_SISTEMA);
        }

        PerfilEntity perfilAtualizado = perfilRepository.save(perfilExistente);
        return perfilMapper.toDTO(perfilAtualizado);
    }

    @Override
    public void excluir(Long id) throws EntityNotFoundException, IllegalStateException {
        log.debug("Excluindo perfil com ID: {}", id);

        PerfilEntity perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Perfil não encontrado com o ID: " + id));

        if (Boolean.TRUE.equals(perfil.getSistemaPerfil())) {
            throw new IllegalStateException("Não é permitido excluir um perfil de sistema");
        }

        perfilRepository.delete(perfil);
    }

    @Override
    public PerfilDTO atribuirPermissoes(Long id, List<String> permissoes) throws EntityNotFoundException {
        log.debug("Atribuindo permissões ao perfil com ID: {}", id);

        PerfilEntity perfil = perfilRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Perfil não encontrado com o ID: " + id));

        String usuarioAtual = getUsuarioAtual();
        perfil.setAtualizadoPor(usuarioAtual);

        // Normaliza permissões: remove nulos/vazios, trim e upper-case, sem duplicatas
        Set<String> normalizadas = (permissoes == null ? Collections.<String>emptyList() : permissoes)
                .stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .map(String::toUpperCase)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        perfil.setPermissoes(normalizadas);

        PerfilEntity perfilAtualizado = perfilRepository.save(perfil);
        return perfilMapper.toDTO(perfilAtualizado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> listarPermissoes() {
        log.debug("Listando todas as permissões disponíveis");

        return Arrays.asList(
                "ADMIN_SISTEMA",
                "ADMIN_UNIDADE",
                "GERENCIAR_USUARIOS",
                "GERENCIAR_PERFIS",
                "GERENCIAR_CONFIGURACOES",
                "GERENCIAR_UNIDADES",
                "GERENCIAR_PACIENTES",
                "GERENCIAR_ATENDIMENTOS",
                "GERENCIAR_AGENDAMENTOS",
                "GERENCIAR_MEDICAMENTOS",
                "GERENCIAR_PROCEDIMENTOS",
                "GERENCIAR_EXAMES",
                "VISUALIZAR_RELATORIOS",
                "RECEPCAO_ATENDER",
                "MEDICO_ATENDER",
                "ENFERMAGEM_ATENDER",
                "FARMACIA_ATENDER",
                "ODONTO_ATENDER"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<PerfilDTO> buscarPorTermo(String termo) {
        final String t = termo == null ? "" : termo.trim();
        log.debug("Buscando perfis por termo: '{}'", t);

        // 1) Busca por nome/descrição (apenas ativos)
        List<PerfilEntity> encontrados = new ArrayList<>(perfilRepository.searchByNomeOuDescricao(t));

        // 2) Se termo bater com algum enum (nome/código/descrição), inclui perfil por tipo
        if (!t.isBlank()) {
            final String upper = normalizar(t);
            for (Perfil p : Perfil.values()) {
                boolean matchEnum =
                        normalizar(p.name()).contains(upper) ||
                                normalizar(p.getCodigo()).contains(upper) ||
                                normalizar(p.getDescricao()).contains(upper);

                if (matchEnum) {
                    perfilRepository.findByTipo(p).ifPresent(pe -> {
                        if (Boolean.TRUE.equals(pe.getAtivo())
                                && encontrados.stream().noneMatch(x -> Objects.equals(x.getId(), pe.getId()))) {
                            encontrados.add(pe);
                        }
                    });
                }
            }
        }

        // Ordena por tipo (comportamento estável)
        encontrados.sort(Comparator.comparing(PerfilEntity::getTipo));
        return encontrados.stream().map(perfilMapper::toDTO).collect(Collectors.toList());
    }

    /**
     * Obtém o usuário atual do contexto de segurança
     */
    private String getUsuarioAtual() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        return "sistema";
    }

    /**
     * Tenta inferir o enum Perfil a partir de um nome legível.
     */
    private Perfil inferirTipoPorNome(String nome) {
        if (nome == null || nome.isBlank()) return null;
        String n = normalizar(nome);

        if (n.contains("ADMIN")) return Perfil.ADMINISTRADOR_DO_SISTEMA;
        if (n.contains("GESTOR")) return Perfil.GESTOR;
        if (n.contains("MEDIC")) return Perfil.MEDICO;
        if (n.contains("ENFERMEIR")) return Perfil.ENFERMEIRO;
        if (n.contains("DENTIST")) return Perfil.DENTISTA;
        if (n.contains("FARMAC")) return Perfil.FARMACEUTICO;
        if (n.contains("TEC") && n.contains("ENFERM")) return Perfil.TECNICO_ENFERMAGEM;
        if (n.contains("TEC") && n.contains("DENTAL")) return Perfil.TECNICO_HIGIENE_DENTAL;
        if (n.contains("TRIAG")) return Perfil.TRIAGEM;
        if (n.contains("RECEP")) return Perfil.RECEPCIONISTA;
        if (n.contains("USUARIO") || n.contains("USUAR")) return Perfil.USUARIO_SISTEMA;

        return null;
    }

    /**
     * Normaliza strings (remove acentos e coloca em maiúsculas) para comparações.
     */
    private String normalizar(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "");
        return n.toUpperCase(Locale.ROOT);
    }
}
