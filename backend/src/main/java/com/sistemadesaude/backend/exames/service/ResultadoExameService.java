package com.sistemadesaude.backend.exames.service;

import com.sistemadesaude.backend.exames.dto.SalvarResultadoRequest;
import com.sistemadesaude.backend.exames.entity.*;
import com.sistemadesaude.backend.exames.repository.*;
import com.sistemadesaude.backend.exception.ResourceNotFoundException;
import com.sistemadesaude.backend.operador.entity.Operador;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ResultadoExameService {

    private final ResultadoExameRepository resultadoRepository;
    private final CampoExameRepository campoRepository;
    private final MetodoExameRepository metodoRepository;

    @Transactional
    public ResultadoExame salvar(SalvarResultadoRequest request, Operador operador) {
        // Buscar ou criar resultado
        ResultadoExame resultado = resultadoRepository
            .findByExameRecepcaoId(request.getExameRecepcaoId())
            .orElse(ResultadoExame.builder()
                .dataResultado(LocalDateTime.now())
                .operadorDigitacao(operador)
                .build());

        // Atualizar dados básicos
        resultado.setResultadoTexto(request.getResultadoTexto());
        resultado.setObservacoes(request.getObservacoes());

        if (request.getMetodoId() != null) {
            MetodoExame metodo = metodoRepository.findById(request.getMetodoId())
                .orElseThrow(() -> new ResourceNotFoundException("Método não encontrado"));
            resultado.setMetodo(metodo);
        }

        // Salvar valores dos campos
        if (request.getValoresCampos() != null) {
            resultado.getValoresCampos().clear();

            for (Map.Entry<Long, String> entry : request.getValoresCampos().entrySet()) {
                CampoExame campo = campoRepository.findById(entry.getKey())
                    .orElseThrow(() -> new ResourceNotFoundException("Campo não encontrado"));

                ValorCampoResultado valor = ValorCampoResultado.builder()
                    .resultado(resultado)
                    .campo(campo)
                    .valor(entry.getValue())
                    .build();

                // Converter para numérico se aplicável
                if (campo.getTipoCampo() == CampoExame.TipoCampo.NUMERO ||
                    campo.getTipoCampo() == CampoExame.TipoCampo.DECIMAL) {
                    try {
                        valor.setValorNumerico(Double.parseDouble(entry.getValue()));

                        // Verificar se está alterado
                        if (resultado.getMetodo() != null) {
                            verificarAlteracao(valor, resultado.getMetodo());
                        }
                    } catch (NumberFormatException e) {
                        // Ignorar erro de conversão
                    }
                }

                resultado.getValoresCampos().add(valor);
            }
        }

        // Liberar laudo se solicitado
        if (request.getLiberarLaudo() != null && request.getLiberarLaudo()) {
            resultado.setLaudoLiberado(true);
            resultado.setDataLiberacao(LocalDateTime.now());
        }

        return resultadoRepository.save(resultado);
    }

    @Transactional(readOnly = true)
    public ResultadoExame buscarPorId(Long id) {
        return resultadoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Resultado não encontrado"));
    }

    @Transactional(readOnly = true)
    public List<ResultadoExame> listarPendentesAssinatura() {
        return resultadoRepository.findResultadosPendentesAssinatura();
    }

    @Transactional
    public void assinar(Long id, Long profissionalId, String assinaturaDigital) {
        ResultadoExame resultado = buscarPorId(id);
        resultado.setAssinado(true);
        resultado.setDataAssinatura(LocalDateTime.now());
        resultado.setAssinaturaDigital(assinaturaDigital);
        resultadoRepository.save(resultado);
    }

    @Transactional(readOnly = true)
    public List<ResultadoExame> listarPendentesDigitacao(Long unidadeId) {
        // Buscar exames coletados que ainda não têm resultado
        if (unidadeId != null) {
            return resultadoRepository.findResultadosPendentesDigitacaoPorUnidade(unidadeId);
        }
        return resultadoRepository.findResultadosPendentesDigitacao();
    }

    private void verificarAlteracao(ValorCampoResultado valor, MetodoExame metodo) {
        if (valor.getValorNumerico() != null) {
            boolean alterado = false;

            if (metodo.getValorReferenciaMin() != null &&
                valor.getValorNumerico() < metodo.getValorReferenciaMin()) {
                alterado = true;
            }

            if (metodo.getValorReferenciaMax() != null &&
                valor.getValorNumerico() > metodo.getValorReferenciaMax()) {
                alterado = true;
            }

            valor.setAlterado(alterado);
        }
    }
}