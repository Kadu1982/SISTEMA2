package com.sistemadesaude.backend;

import static org.junit.jupiter.api.Assertions.assertTrue;

import javax.sql.DataSource;
import java.sql.Connection;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:postgresql://localhost:5432/saude_db",
        "spring.datasource.username=postgres",
        "spring.datasource.password=postgres"
})
class DatabaseConnectionTest {

    @Autowired
    private DataSource dataSource;

    @Test
    void connectsToDatabase() throws Exception {
        try (Connection conn = dataSource.getConnection()) {
            assertTrue(conn.isValid(2));     // verifies connection is accepted
        }
    }
}
