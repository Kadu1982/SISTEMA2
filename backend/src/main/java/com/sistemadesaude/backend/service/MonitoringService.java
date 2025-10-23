package com.sistemadesaude.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.lang.management.ManagementFactory;
import java.lang.management.MemoryMXBean;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Serviço de monitoramento da aplicação.
 * Coleta e fornece métricas sobre o desempenho e saúde da aplicação.
 */
@Service
public class MonitoringService {

    // Logger para registrar eventos e erros
    private static final Logger logger = LoggerFactory.getLogger(MonitoringService.class);
    
    // Contador de requisições por endpoint
    private final Map<String, AtomicLong> requestCounters = new ConcurrentHashMap<>();
    
    // Tempo médio de resposta por endpoint (em milissegundos)
    private final Map<String, Double> averageResponseTimes = new ConcurrentHashMap<>();
    
    // Contador de erros por endpoint
    private final Map<String, AtomicLong> errorCounters = new ConcurrentHashMap<>();
    
    // Timestamp de início da aplicação
    private final long startTime = System.currentTimeMillis();

    /**
     * Registra uma requisição para um endpoint específico.
     * 
     * @param endpoint Nome do endpoint (ex: "/api/pacientes")
     */
    public void registerRequest(String endpoint) {
        // Incrementa o contador de requisições para o endpoint
        requestCounters.computeIfAbsent(endpoint, k -> new AtomicLong(0)).incrementAndGet();
    }

    /**
     * Registra o tempo de resposta para um endpoint específico.
     * 
     * @param endpoint Nome do endpoint
     * @param responseTimeMs Tempo de resposta em milissegundos
     */
    public void registerResponseTime(String endpoint, long responseTimeMs) {
        // Calcula a média móvel do tempo de resposta
        Double currentAvg = averageResponseTimes.getOrDefault(endpoint, 0.0);
        long count = requestCounters.getOrDefault(endpoint, new AtomicLong(0)).get();
        
        // Fórmula para média móvel: newAvg = oldAvg * (n-1)/n + newValue/n
        double newAvg = count > 1 
            ? currentAvg * ((double)(count - 1) / count) + ((double)responseTimeMs / count)
            : responseTimeMs;
            
        averageResponseTimes.put(endpoint, newAvg);
    }

    /**
     * Registra um erro para um endpoint específico.
     * 
     * @param endpoint Nome do endpoint
     */
    public void registerError(String endpoint) {
        // Incrementa o contador de erros para o endpoint
        errorCounters.computeIfAbsent(endpoint, k -> new AtomicLong(0)).incrementAndGet();
        
        // Registra o erro no log
        logger.error("Erro registrado no endpoint: {}", endpoint);
    }

    /**
     * Obtém estatísticas de uso da aplicação.
     * 
     * @return Mapa com estatísticas de uso
     */
    public Map<String, Object> getUsageStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        // Estatísticas de requisições
        Map<String, Object> requestStats = new HashMap<>();
        requestCounters.forEach((endpoint, count) -> {
            Map<String, Object> endpointStats = new HashMap<>();
            endpointStats.put("count", count.get());
            endpointStats.put("averageResponseTime", averageResponseTimes.getOrDefault(endpoint, 0.0));
            endpointStats.put("errors", errorCounters.getOrDefault(endpoint, new AtomicLong(0)).get());
            requestStats.put(endpoint, endpointStats);
        });
        
        stats.put("endpoints", requestStats);
        stats.put("uptime", System.currentTimeMillis() - startTime);
        
        return stats;
    }

    /**
     * Obtém métricas do sistema.
     * 
     * @return Mapa com métricas do sistema
     */
    public Map<String, Object> getSystemMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        // Informações de memória
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        Map<String, Object> memoryMetrics = new HashMap<>();
        memoryMetrics.put("heapUsed", memoryBean.getHeapMemoryUsage().getUsed());
        memoryMetrics.put("heapMax", memoryBean.getHeapMemoryUsage().getMax());
        memoryMetrics.put("nonHeapUsed", memoryBean.getNonHeapMemoryUsage().getUsed());
        metrics.put("memory", memoryMetrics);
        
        // Informações do sistema operacional
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        Map<String, Object> osMetrics = new HashMap<>();
        osMetrics.put("availableProcessors", osBean.getAvailableProcessors());
        osMetrics.put("systemLoadAverage", osBean.getSystemLoadAverage());
        metrics.put("os", osMetrics);
        
        // Informações de runtime
        RuntimeMXBean runtimeBean = ManagementFactory.getRuntimeMXBean();
        Map<String, Object> runtimeMetrics = new HashMap<>();
        runtimeMetrics.put("startTime", runtimeBean.getStartTime());
        runtimeMetrics.put("uptime", runtimeBean.getUptime());
        runtimeMetrics.put("vmName", runtimeBean.getVmName());
        runtimeMetrics.put("vmVersion", runtimeBean.getVmVersion());
        metrics.put("runtime", runtimeMetrics);
        
        return metrics;
    }

    /**
     * Verifica a saúde da aplicação.
     * 
     * @return Mapa com status de saúde da aplicação
     */
    public Map<String, Object> getHealthStatus() {
        Map<String, Object> health = new HashMap<>();
        
        // Status geral da aplicação
        health.put("status", "UP");
        
        // Tempo de atividade
        health.put("uptime", System.currentTimeMillis() - startTime);
        
        // Uso de memória
        MemoryMXBean memoryBean = ManagementFactory.getMemoryMXBean();
        double memoryUsage = (double) memoryBean.getHeapMemoryUsage().getUsed() / 
                             memoryBean.getHeapMemoryUsage().getMax();
        health.put("memoryUsage", memoryUsage);
        
        // Verifica se o uso de memória está crítico
        if (memoryUsage > 0.9) {
            health.put("status", "WARNING");
            health.put("warning", "Uso de memória elevado");
        }
        
        return health;
    }
}
