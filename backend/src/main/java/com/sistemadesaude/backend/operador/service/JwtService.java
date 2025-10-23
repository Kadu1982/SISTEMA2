package com.sistemadesaude.backend.operador.service;

import com.sistemadesaude.backend.operador.entity.Operador;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.expiration:36800000}")
    private long expiration; // Default: 8 horas (36800000 ms)

    @Value("${jwt.secret:minhaSuperSecretKeyParaJWT2024SistemaDeHealthCare123456789}")
    private String secretKey;

    private Key key;

    @PostConstruct
    public void init() {
        // Usa a chave secreta das propriedades para criar uma chave HMAC-SHA
        this.key = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Gera token JWT para o operador
     * ✅ CORRIGIDO: Usa unidadeSaudeId em vez de getUnidade()
     */
    public String gerarToken(Operador operador) {
        return Jwts.builder()
                .setSubject(operador.getLogin())
                .claim("id", operador.getId())
                .claim("nome", operador.getNome())
                .claim("login", operador.getLogin())
                .claim("isMaster", operador.getIsMaster())
                .claim("perfis", operador.getPerfis())
                .claim("unidadeId", operador.getUnidadeSaudeId()) // ✅ CORRIGIDO: usa unidadeSaudeId
                .claim("unidadeAtualId", operador.getUnidadeAtualId()) // ✅ ADICIONADO: unidade atual
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key)
                .compact();
    }

    // --- MÉTODOS ADICIONADOS PARA LER E VALIDAR O TOKEN ---

    /**
     * Extrai o nome de usuário (subject) do token JWT.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Valida o token verificando se o nome de usuário corresponde ao UserDetails e se não está expirado.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Validação simples para o filtro, checando apenas se o token pode ser lido e não está expirado.
     */
    public boolean validateToken(String token) {
        try {
            return !isTokenExpired(token);
        } catch (Exception e) {
            // Se houver qualquer erro no parse (assinatura inválida, etc.), o token é inválido.
            return false;
        }
    }

    /**
     * Extrai todas as informações (claims) do token. É a base para os outros métodos de extração.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Função genérica para extrair uma claim específica do token.
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Verifica se o token JWT expirou.
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extrai a data de expiração do token.
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }
}
