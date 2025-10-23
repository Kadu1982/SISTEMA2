package com.sistemadesaude.backend.triagem.entity;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Arrays;

@Getter
@RequiredArgsConstructor
public enum ProtocoloMinisterioSaude {

    DENGUE(
            "Protocolo de Dengue",
            List.of("dor no corpo", "febre", "dor de cabeça", "olhos vermelhos", "falta de apetite", "náusea", "vômito"),
            // Critérios: febre + 2 sintomas + temperatura > 38°C
            "Febre alta (>38°C), cefaleia, mialgia, artralgia, dor retro-orbital",
            List.of("Dengue clássica", "Dengue hemorrágica", "Síndrome do choque da dengue"),
            "Hidratação oral abundante, paracetamol para febre/dor, repouso, retorno em 24h ou se piora",
            ClassificacaoRisco.LARANJA
    ),

    COVID19(
            "Protocolo COVID-19",
            List.of("febre", "tosse seca", "cansaço", "falta de ar", "perda de olfato", "perda de paladar", "dor de garganta"),
            "Febre, tosse, dispneia, anosmia, ageusia",
            List.of("COVID-19 leve", "COVID-19 moderada", "COVID-19 grave", "Síndrome respiratória aguda"),
            "Isolamento domiciliar, sintomáticos, hidratação, O2 se saturação <95%",
            ClassificacaoRisco.AMARELO
    ),

    HIPERTENSAO_CRISE(
            "Protocolo Crise Hipertensiva",
            List.of("dor de cabeça intensa", "tontura", "visão turva", "dor no peito", "falta de ar"),
            "PA sistólica >180mmHg ou diastólica >120mmHg + sintomas",
            List.of("Crise hipertensiva", "Emergência hipertensiva", "Urgência hipertensiva"),
            "Anti-hipertensivo sublingual, monitorização contínua, investigar lesão de órgão-alvo",
            ClassificacaoRisco.VERMELHO
    ),

    INFARTO_AGUDO(
            "Protocolo Infarto Agudo do Miocárdio",
            List.of("dor no peito", "dor no braço esquerdo", "falta de ar", "suor frio", "náusea"),
            "Dor precordial típica + irradiação + sintomas associados",
            List.of("Infarto agudo do miocárdio", "Síndrome coronariana aguda", "Angina instável"),
            "ECG imediato, AAS 300mg, clopidogrel 300mg, O2 se saturação <94%, acesso venoso, troponina",
            ClassificacaoRisco.VERMELHO
    ),

    AVC_AGUDO(
            "Protocolo AVC Agudo",
            List.of("perda de força", "dificuldade para falar", "tontura", "perda de visão", "dor de cabeça súbita"),
            "Déficit neurológico focal súbito",
            List.of("AVC isquêmico", "AVC hemorrágico", "AIT - Ataque isquêmico transitório"),
            "TC crânio urgente, glicemia, PA, via aérea pérvia, NIH Stroke Scale",
            ClassificacaoRisco.VERMELHO
    );

    private final String nome;
    private final List<String> palavrasChave;
    private final String criteriosClirnicos;
    private final List<String> diagnosticosSugeridos;
    private final String condutaSugerida;
    private final ClassificacaoRisco classificacaoSugerida;

    public static ProtocoloMinisterioSaude analisarQueixa(String queixa, Double temperatura, Integer saturacao, String pressaoArterial) {
        if (queixa == null) return null;

        String queixaLower = queixa.toLowerCase();

        // Análise de Dengue
        if (contemPalavras(queixaLower, DENGUE.palavrasChave, 2) &&
                (temperatura != null && temperatura > 38.0)) {
            return DENGUE;
        }

        // Análise de COVID-19
        if (contemPalavras(queixaLower, COVID19.palavrasChave, 2) &&
                (saturacao != null && saturacao < 95)) {
            return COVID19;
        }

        // Análise de Crise Hipertensiva
        if (contemPalavras(queixaLower, HIPERTENSAO_CRISE.palavrasChave, 1) &&
                isHipertensaoSevera(pressaoArterial)) {
            return HIPERTENSAO_CRISE;
        }

        // Análise de Infarto
        if (contemPalavras(queixaLower, INFARTO_AGUDO.palavrasChave, 2)) {
            return INFARTO_AGUDO;
        }

        // Análise de AVC
        if (contemPalavras(queixaLower, AVC_AGUDO.palavrasChave, 1)) {
            return AVC_AGUDO;
        }

        return null;
    }

    private static boolean contemPalavras(String texto, List<String> palavras, int minimoOcorrencias) {
        long count = palavras.stream()
                .mapToLong(palavra -> Arrays.stream(texto.split("\\s+"))
                        .filter(p -> p.contains(palavra))
                        .count())
                .sum();
        return count >= minimoOcorrencias;
    }

    private static boolean isHipertensaoSevera(String pressaoArterial) {
        if (pressaoArterial == null) return false;
        try {
            String[] partes = pressaoArterial.split("x|/");
            if (partes.length >= 2) {
                int sistolica = Integer.parseInt(partes[0].trim());
                int diastolica = Integer.parseInt(partes[1].trim());
                return sistolica > 180 || diastolica > 120;
            }
        } catch (NumberFormatException e) {
            return false;
        }
        return false;
    }
}
