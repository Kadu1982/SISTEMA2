import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import operadoresService from "@/services/operadoresService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";

/**
 * Tela de Aceite do Termo de Uso
 *
 * ✅ Mudança importante:
 * - A prop operadorId agora é OPCIONAL.
 * - Se não vier por prop, resolvemos por:
 *   1) querystring ?operadorId=123
 *   2) localStorage.operadorData (id ou operadorId)
 *
 * Assim, sua rota pode continuar:  <Route path="/termo-uso" element={<TermoUso />} />
 * e o Login continua navegando para /termo-uso?operadorId=...
 */

type TermoVigenteDTO = { versao: string; texto: string; aceito: boolean };

interface Props {
    /** Se não informado, será resolvido por querystring/localStorage */
    operadorId?: number;
    /** Callback opcional após aceite com sucesso (ex.: redirecionar para /home) */
    onAceito?: () => void;
}

const TermoUso: React.FC<Props> = ({ operadorId, onAceito }) => {
    const navigate = useNavigate();

    // --- Resolve o operadorId (prop -> query -> localStorage) ---
    const resolvedOperadorId = useMemo<number | null>(() => {
        // 1) veio por prop?
        if (typeof operadorId === "number" && Number.isFinite(operadorId) && operadorId > 0) {
            return operadorId;
        }

        // 2) veio na querystring?
        try {
            const sp = new URLSearchParams(window.location.search);
            const fromQuery = Number(sp.get("operadorId"));
            if (Number.isFinite(fromQuery) && fromQuery > 0) return fromQuery;
        } catch (_) { /* ignore */ }

        // 3) tentar no localStorage (operadorData.id ou operadorData.operadorId)
        try {
            const raw = localStorage.getItem("operadorData");
            if (raw) {
                const op = JSON.parse(raw);
                const id = Number(op?.id ?? op?.operadorId);
                if (Number.isFinite(id) && id > 0) return id;
            }
        } catch (_) { /* ignore */ }

        // falhou
        return null;
    }, [operadorId]);

    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState<string | null>(null);

    const [versao, setVersao] = useState("");
    const [texto, setTexto] = useState("");
    const [aceito, setAceito] = useState<boolean | null>(null);

    // Campos do formulário de aceite:
    const [motivo, setMotivo] = useState("USO DO SISTEMA");
    const [observacao, setObservacao] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [okMsg, setOkMsg] = useState<string | null>(null);

    // Carrega termo vigente quando temos operadorId resolvido
    useEffect(() => {
        let ativo = true;

        (async () => {
            if (!resolvedOperadorId) {
                setLoading(false);
                setErro("Não foi possível identificar o operador. Faça login novamente.");
                return;
            }

            setLoading(true);
            setErro(null);
            setOkMsg(null);
            try {
                const t: TermoVigenteDTO = await operadoresService.obterTermo(resolvedOperadorId);
                if (!ativo) return;
                setVersao(t.versao ?? "");
                setTexto(t.texto ?? "");
                setAceito(!!t.aceito);
            } catch (e: any) {
                if (!ativo) return;
                setErro("Falha ao carregar o Termo de Uso. Tente novamente.");
            } finally {
                if (ativo) setLoading(false);
            }
        })();

        return () => { ativo = false; };
    }, [resolvedOperadorId]);

    const aceitar = async () => {
        if (!resolvedOperadorId) return;
        setSalvando(true);
        setErro(null);
        setOkMsg(null);
        try {
            await operadoresService.aceitarTermo(resolvedOperadorId, versao, motivo, observacao || undefined);
            setAceito(true);
            setOkMsg("Termo aceito com sucesso.");
            // Se não passaram callback, voltamos para a home
            if (onAceito) onAceito();
            else navigate("/", { replace: true });
        } catch (e: any) {
            setErro("Não foi possível registrar o aceite. Verifique sua conexão e tente novamente.");
        } finally {
            setSalvando(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <Card className="max-w-4xl mx-auto">
                <CardHeader>
                    <CardTitle>Termo de Uso do Sistema</CardTitle>
                    <CardDescription>
                        Versão vigente: <span className="font-mono">{versao || "—"}</span>
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Estados de carregamento/erro/ok */}
                    {loading && (
                        <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" /> Carregando termo…
                        </div>
                    )}
                    {erro && (
                        <div className="text-sm text-red-600">{erro}</div>
                    )}
                    {okMsg && (
                        <div className="text-sm text-green-700 flex items-center gap-2">
                            <Check className="h-4 w-4" /> {okMsg}
                        </div>
                    )}

                    {/* Guard: sem operadorId resolvido */}
                    {!resolvedOperadorId && (
                        <div className="space-y-3">
                            <p className="text-sm">Não foi possível identificar o operador. Retorne ao login.</p>
                            <Button onClick={() => navigate("/login", { replace: true })}>Ir para o login</Button>
                        </div>
                    )}

                    {/* Texto do termo + formulário */}
                    {resolvedOperadorId && (
                        <>
                            <div className="border rounded p-3 h-80 overflow-auto whitespace-pre-wrap text-sm bg-muted/30">
                                {texto || "—"}
                            </div>

                            {aceito ? (
                                <div className="text-sm text-green-700 flex items-center gap-2">
                                    <Check className="h-4 w-4" /> Este operador já aceitou a versão vigente do termo.
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="motivo">Motivo</Label>
                                            <Input
                                                id="motivo"
                                                value={motivo}
                                                onChange={(e) => setMotivo(e.target.value)}
                                                placeholder="Ex.: USO DO SISTEMA"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="observacao">Observação (opcional)</Label>
                                            <Input
                                                id="observacao"
                                                value={observacao}
                                                onChange={(e) => setObservacao(e.target.value)}
                                                placeholder="Observação livre"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Button onClick={aceitar} disabled={salvando || loading}>
                                            {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                                            Aceitar e continuar
                                        </Button>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TermoUso;
