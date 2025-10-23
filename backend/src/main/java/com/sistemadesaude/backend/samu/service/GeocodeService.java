package com.sistemadesaude.backend.samu.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class GeocodeService {

    public Coordenadas obterCoordenadas(String endereco) {
        log.info("📍 Obtendo coordenadas para: {}", endereco);
        // Implementar geocoding real
        return new Coordenadas(-23.5505, -46.6333); // Exemplo: São Paulo
    }

    public static class Coordenadas {
        private final Double latitude;
        private final Double longitude;

        public Coordenadas(Double latitude, Double longitude) {
            this.latitude = latitude;
            this.longitude = longitude;
        }

        public Double getLatitude() { return latitude; }
        public Double getLongitude() { return longitude; }
    }
}
