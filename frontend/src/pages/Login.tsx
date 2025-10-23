import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, User, Lock, Trash } from 'lucide-react';
import { login as authLogin } from '@/services/authService';
// import { useOperador } from '@/contexts/OperadorContext'; // se quiser hidratar o contexto aqui

/**
 * 🔎 Como o fundo é resolvido
 * 1) Se existir VITE_LOGIN_BG_URL no .env, usa esse caminho.
 * 2) Senão tenta, na sequência:
 *    - /assets/Gemini_Generated_Image_n0g1kin0g1kin0g1.png
 *    - /Gemini_Generated_Image_n0g1kin0g1kin0g1.png   (arquivo direto em /public)
 * 3) Se nada carregar, cai no gradiente original.
 */
const ENV_BG = import.meta.env.VITE_LOGIN_BG_URL as string | undefined;

const CANDIDATES: string[] = [
    ...(ENV_BG ? [ENV_BG] : []),
    '/assets/Gemini_Generated_Image_n0g1kin0g1kin0g1.png',
    '/Gemini_Generated_Image_n0g1kin0g1kin0g1.png',
];

function preload(src: string) {
    return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = src;
    });
}

async function findFirstAvailable(candidates: string[]): Promise<string | null> {
    for (const c of candidates) {
        if (!c || !c.trim()) continue;
        const ok = await preload(c);
        if (ok) return c;
    }
    return null;
}

type LoginResponseDTO = {
    token: string;
    operador: any;
    /** NOVO: pode vir do backend; se não vier, tratamos como false */
    requiresTermAccept?: boolean;
};

const Login: React.FC = () => {
    // ---------- ESTADO ----------
    const [login, setLogin] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [bgUrl, setBgUrl] = useState<string | null>(null);
    const [tipoUnidade, setTipoUnidade] = useState('UBS'); // 🏥 Novo campo

    const navigate = useNavigate();
    // const { setOperador } = useOperador(); // se quiser popular contexto aqui

    // ---------- RESOLVE O FUNDO NA MONTAGEM ----------
    useEffect(() => {
        let mounted = true;
        (async () => {
            const url = await findFirstAvailable(CANDIDATES);
            if (mounted) setBgUrl(url);
        })();
        return () => { mounted = false; };
    }, []);

    // Estilo de background quando há imagem
    const bgStyle: React.CSSProperties = useMemo(() => {
        if (!bgUrl) return {};
        return {
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
        };
    }, [bgUrl]);

    // ---------- SUBMIT ----------
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);

            // Limpa antes do novo login
            localStorage.clear();
            sessionStorage.clear();

            // Autenticação
            const response = await authLogin({ login, senha }) as LoginResponseDTO;
            const { token, operador, requiresTermAccept } = response || ({} as LoginResponseDTO);

            if (!token || token.length < 10) throw new Error('Token inválido');

            // Persistência para interceptors/guard e tela do termo
            localStorage.setItem('token', token);

            // 🏥 Modifica o operador para incluir o tipo de unidade selecionado
            const operadorComUnidade = {
                ...operador,
                unidadeAtual: tipoUnidade
            };
            localStorage.setItem('operadorData', JSON.stringify(operadorComUnidade));

            toast({
                title: 'Login realizado com sucesso!',
                description: `Bem-vindo, ${operador?.nome || 'Operador'}!`,
            });

            // 🔒 Se o backend exigir aceite do termo, redireciona para a tela de Termo
            if (requiresTermAccept === true) {
                const operadorId = operador?.id ?? operador?.operadorId ?? '';
                // guardamos um flag (opcional) só pra facilitar fluxos
                sessionStorage.setItem('requiresTermAccept', 'true');
                // ajuste o path abaixo caso sua rota seja diferente (ex.: '/operadores/termo-uso')
                navigate(`/termo-uso?operadorId=${encodeURIComponent(operadorId)}`, { replace: true });
                return; // não recarrega o app agora
            }

            /**
             * ✅ Fluxo normal (sem termo):
             * Muitos guards/Providers lêem o token apenas na montagem do app.
             * Por isso, navegamos para "/" e forçamos um reload para reidratar o contexto.
             */
            navigate('/', { replace: true });
            window.location.reload(); // força rehidratação do Provider/rotas protegidas
        } catch (error: any) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Falha no login',
                description: String(error?.message || error),
            });
        } finally {
            setLoading(false);
        }
    };

    const limpezaCompleta = () => {
        localStorage.clear();
        sessionStorage.clear();
        toast({ title: 'Limpeza completa', description: 'Todos os dados foram removidos.' });
    };

    const preencherMaster = () => {
        setLogin('admin.master');
        setSenha('Admin@123');
    };

    // Container cobre 100% da tela; se não houver imagem, mostra gradiente
    const containerClass = bgUrl
        ? 'min-h-screen flex items-center justify-center p-4'
        : 'min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100';

    return (
        <div style={bgStyle} className={containerClass}>
            <Card className="w-full max-w-md backdrop-blur bg-white/90">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">VITALIZA SAÚDE</CardTitle>
                    <p className="text-center text-gray-600">by AXIUM SISTEMAS</p>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="login">Login</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="login"
                                    placeholder="nome.sobrenome"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="senha">Senha</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="senha"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Sua senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    className="pl-9 pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-2.5 text-gray-500"
                                    onClick={() => setShowPassword((v) => !v)}
                                    aria-label="Mostrar/ocultar senha"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* 🏥 Seletor de Tipo de Unidade */}
                        <div className="space-y-2">
                            <Label htmlFor="tipoUnidade">Tipo de Unidade (Teste)</Label>
                            <select
                                id="tipoUnidade"
                                value={tipoUnidade}
                                onChange={(e) => setTipoUnidade(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="UBS">UBS - Unidade Básica de Saúde</option>
                                <option value="PSF">PSF - Programa Saúde da Família</option>
                                <option value="Hospital Regional">🏥 Hospital Regional</option>
                                <option value="UPA Norte">🚑 UPA Norte</option>
                                <option value="Pronto Socorro Central">🏥 Pronto Socorro Central</option>
                                <option value="Hospital Municipal">🏥 Hospital Municipal</option>
                                <option value="Clínica Especializada">🏥 Clínica Especializada</option>
                                <option value="Maternidade Santa Casa">🏥 Maternidade Santa Casa</option>
                                <option value="Secretaria de Saúde">🏛️ Secretaria de Saúde</option>
                            </select>
                            <p className="text-xs text-gray-500">
                                💡 Selecione "Hospital" para testar o Módulo Hospitalar
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={limpezaCompleta}
                                className="px-3"
                                title="Limpeza completa"
                            >
                                <Trash className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>

                    {/* Utilidades */}
                    <div className="mt-4 space-y-2">
                        <Button type="button" variant="secondary" onClick={preencherMaster}>
                            Preencher admin.master
                        </Button>
                    </div>

                    {/* Credenciais de teste (mantido) */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
                        <p className="font-medium text-gray-700">Credenciais Master:</p>
                        <p className="text-gray-600">Login: admin.master</p>
                        <p className="text-gray-600">Senha: Admin@123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
