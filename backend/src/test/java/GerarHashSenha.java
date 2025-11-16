import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHashSenha {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String senha = "Admin@123";
        String hash = encoder.encode(senha);

        System.out.println("Senha: " + senha);
        System.out.println("Hash: " + hash);

        // Verificar se o hash é válido
        boolean matches = encoder.matches(senha, hash);
        System.out.println("Validação: " + matches);
    }
}
