import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHashSenha {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        // Gerar hash para Admin@123
        String senha = "Admin@123";
        String hash = encoder.encode(senha);

        System.out.println("========================================");
        System.out.println("Senha: " + senha);
        System.out.println("Hash:  " + hash);
        System.out.println("========================================");

        // Testar se o hash funciona
        boolean matches = encoder.matches(senha, hash);
        System.out.println("Validação: " + (matches ? "OK" : "FALHOU"));

        // Testar com o hash que você está usando
        String hashAntigo = "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG";
        boolean matchesAntigo = encoder.matches(senha, hashAntigo);
        System.out.println("Hash antigo valida? " + (matchesAntigo ? "SIM" : "NÃO"));
    }
}
