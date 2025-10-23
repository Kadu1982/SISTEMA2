package com.sistemadesaude.backend.configuracoes.service;

import com.sistemadesaude.backend.configuracoes.dto.ConfiguracaoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

/**
 * Serviço para inicialização automática das configurações padrão do sistema
 * Executa na inicialização da aplicação
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConfiguracaoInicializadorService implements CommandLineRunner {

    private final ConfiguracaoService configuracaoService;

    @Override
    public void run(String... args) {
        log.info("🔧 Inicializando configurações padrão do sistema...");

        try {
            inicializarConfiguracoesPadrao();
            log.info("✅ Configurações padrão inicializadas com sucesso");
        } catch (Exception e) {
            log.error("❌ Erro ao inicializar configurações padrão: {}", e.getMessage(), e);
        }
    }

    private void inicializarConfiguracoesPadrao() {
        List<ConfiguracaoDTO> configuracoesIniciais = Arrays.asList(
            // ===== GRUPO: GERAL =====
            ConfiguracaoDTO.builder()
                .chave("sistema.nome")
                .valor("Sistema de Gestão em Saúde")
                .descricao("Nome do sistema exibido na interface")
                .grupo("GERAL")
                .tipo("string")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("sistema.versao")
                .valor("5.18.8")
                .descricao("Versão atual do sistema")
                .grupo("GERAL")
                .tipo("string")
                .editavel(false)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("sistema.timezone")
                .valor("America/Sao_Paulo")
                .descricao("Fuso horário padrão do sistema")
                .grupo("GERAL")
                .tipo("string")
                .editavel(true)
                .valoresPossiveis("America/Sao_Paulo,America/Recife,America/Manaus,America/Rio_Branco")
                .build(),

            ConfiguracaoDTO.builder()
                .chave("sistema.timeout_sessao")
                .valor("30")
                .descricao("Timeout de sessão em minutos")
                .grupo("GERAL")
                .tipo("number")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("sistema.manutencao_ativa")
                .valor("false")
                .descricao("Indica se o sistema está em manutenção")
                .grupo("GERAL")
                .tipo("boolean")
                .editavel(true)
                .build(),

            // ===== GRUPO: BACKUP =====
            ConfiguracaoDTO.builder()
                .chave("backup.automatico_ativo")
                .valor("true")
                .descricao("Ativa backup automático do banco de dados")
                .grupo("BACKUP")
                .tipo("boolean")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("backup.horario_execucao")
                .valor("02:00")
                .descricao("Horário para execução do backup automático")
                .grupo("BACKUP")
                .tipo("time")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("backup.dias_retencao")
                .valor("30")
                .descricao("Número de dias para manter backups antigos")
                .grupo("BACKUP")
                .tipo("number")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("backup.diretorio")
                .valor("/var/backup/sistema")
                .descricao("Diretório onde os backups são armazenados")
                .grupo("BACKUP")
                .tipo("string")
                .editavel(true)
                .build(),

            // ===== GRUPO: EMAIL/SMTP =====
            ConfiguracaoDTO.builder()
                .chave("email.smtp_host")
                .valor("smtp.gmail.com")
                .descricao("Servidor SMTP para envio de emails")
                .grupo("EMAIL")
                .tipo("string")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("email.smtp_porta")
                .valor("587")
                .descricao("Porta do servidor SMTP")
                .grupo("EMAIL")
                .tipo("number")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("email.smtp_usuario")
                .valor("")
                .descricao("Usuário para autenticação SMTP")
                .grupo("EMAIL")
                .tipo("string")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("email.smtp_senha")
                .valor("")
                .descricao("Senha para autenticação SMTP")
                .grupo("EMAIL")
                .tipo("password")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("email.ssl_ativo")
                .valor("true")
                .descricao("Ativa SSL/TLS para conexão SMTP")
                .grupo("EMAIL")
                .tipo("boolean")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("email.remetente_padrao")
                .valor("noreply@sistemasaude.gov.br")
                .descricao("Email remetente padrão do sistema")
                .grupo("EMAIL")
                .tipo("email")
                .editavel(true)
                .build(),

            // ===== GRUPO: SEGURANCA =====
            ConfiguracaoDTO.builder()
                .chave("seguranca.max_tentativas_login")
                .valor("5")
                .descricao("Máximo de tentativas de login antes do bloqueio")
                .grupo("SEGURANCA")
                .tipo("number")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("seguranca.tempo_bloqueio_login")
                .valor("15")
                .descricao("Tempo de bloqueio após exceder tentativas (minutos)")
                .grupo("SEGURANCA")
                .tipo("number")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("seguranca.ips_permitidos")
                .valor("0.0.0.0/0")
                .descricao("IPs ou faixas permitidas (separadas por vírgula)")
                .grupo("SEGURANCA")
                .tipo("text")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("seguranca.log_auditoria_ativo")
                .valor("true")
                .descricao("Ativa logs de auditoria detalhados")
                .grupo("SEGURANCA")
                .tipo("boolean")
                .editavel(true)
                .build(),

            // ===== GRUPO: INTEGRACOES =====
            ConfiguracaoDTO.builder()
                .chave("esus.url_webservice")
                .valor("")
                .descricao("URL do webservice e-SUS AB")
                .grupo("INTEGRACOES")
                .tipo("url")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("esus.usuario")
                .valor("")
                .descricao("Usuário para integração e-SUS")
                .grupo("INTEGRACOES")
                .tipo("string")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("esus.senha")
                .valor("")
                .descricao("Senha para integração e-SUS")
                .grupo("INTEGRACOES")
                .tipo("password")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("rnds.url_webservice")
                .valor("https://rnds.saude.gov.br")
                .descricao("URL da RNDS - Rede Nacional de Dados em Saúde")
                .grupo("INTEGRACOES")
                .tipo("url")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("rnds.certificado_digital")
                .valor("")
                .descricao("Caminho para o certificado digital A1")
                .grupo("INTEGRACOES")
                .tipo("file")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("sipni.url_webservice")
                .valor("")
                .descricao("URL do webservice SI-PNI")
                .grupo("INTEGRACOES")
                .tipo("url")
                .editavel(true)
                .build(),

            // ===== GRUPO: RELATORIOS =====
            ConfiguracaoDTO.builder()
                .chave("relatorios.logo_sistema")
                .valor("/assets/images/logo-sistema.png")
                .descricao("Caminho para logo do sistema nos relatórios")
                .grupo("RELATORIOS")
                .tipo("file")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("relatorios.brasao_municipio")
                .valor("/assets/images/brasao-municipio.png")
                .descricao("Caminho para brasão do município nos relatórios")
                .grupo("RELATORIOS")
                .tipo("file")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("relatorios.nome_municipio")
                .valor("")
                .descricao("Nome do município para cabeçalho dos relatórios")
                .grupo("RELATORIOS")
                .tipo("string")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("relatorios.secretaria_saude")
                .valor("Secretaria Municipal de Saúde")
                .descricao("Nome da secretaria de saúde")
                .grupo("RELATORIOS")
                .tipo("string")
                .editavel(true)
                .build(),

            // ===== GRUPO: NOTIFICACOES =====
            ConfiguracaoDTO.builder()
                .chave("notificacoes.email_ativo")
                .valor("false")
                .descricao("Ativa notificações por email")
                .grupo("NOTIFICACOES")
                .tipo("boolean")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("notificacoes.sms_ativo")
                .valor("false")
                .descricao("Ativa notificações por SMS")
                .grupo("NOTIFICACOES")
                .tipo("boolean")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("notificacoes.agendamento_24h")
                .valor("true")
                .descricao("Envia lembrete de agendamento 24h antes")
                .grupo("NOTIFICACOES")
                .tipo("boolean")
                .editavel(true)
                .build(),

            ConfiguracaoDTO.builder()
                .chave("notificacoes.agendamento_2h")
                .valor("false")
                .descricao("Envia lembrete de agendamento 2h antes")
                .grupo("NOTIFICACOES")
                .tipo("boolean")
                .editavel(true)
                .build()
        );

        // Salva apenas configurações que ainda não existem
        for (ConfiguracaoDTO config : configuracoesIniciais) {
            try {
                if (configuracaoService.buscarPorChave(config.getChave()).isEmpty()) {
                    configuracaoService.salvar(config);
                    log.debug("✅ Configuração criada: {}", config.getChave());
                } else {
                    log.debug("⏭️ Configuração já existe: {}", config.getChave());
                }
            } catch (Exception e) {
                log.warn("⚠️ Erro ao criar configuração {}: {}", config.getChave(), e.getMessage());
            }
        }
    }
}