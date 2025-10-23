import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useOperador } from '@/contexts/OperadorContext';
import apiService from '@/services/apiService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
    login: z.string().min(1, { message: "O campo login é obrigatório." }),
    senha: z.string().min(1, { message: "O campo senha é obrigatório." }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

type LoginResponseDTO = {
    token: string;
    operador: any;
    /** NOVO: pode vir do backend; se não vier, tratamos como false */
    requiresTermAccept?: boolean;
};

export default function LoginOperador() {
    const navigate = useNavigate();
    const { login: loginContextAction } = useOperador();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { login: '', senha: '' },
    });

    const handleLoginSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);
        setServerError(null);

        try {
            // 🔐 Autentica
            const resp = await apiService.post('/auth/login', {
                login: data.login,
                senha: data.senha,
            });
            const { token, operador, requiresTermAccept } = (resp?.data || {}) as LoginResponseDTO;

            // Guarda no contexto (e onde mais seu app precisar)
            loginContextAction(token, operador);

            // Também persistimos em localStorage, se o seu contexto/guard depende:
            localStorage.setItem('token', token || '');
            localStorage.setItem('operadorData', JSON.stringify(operador || {}));

            // 🔒 Fluxo do Termo de Uso
            if (requiresTermAccept === true) {
                const operadorId = operador?.id ?? operador?.operadorId ?? '';
                sessionStorage.setItem('requiresTermAccept', 'true');
                // ajuste a rota caso use outro path:
                navigate(`/termo-uso?operadorId=${encodeURIComponent(operadorId)}`, { replace: true });
                return; // não segue para dashboard ainda
            }

            // ✅ Fluxo normal: segue para a rota por perfil (mantido)
            if (operador?.perfis?.includes?.('ADMINISTRADOR_DO_SISTEMA')) {
                navigate('/dashboard');
            } else if (operador?.perfis?.includes?.('RECEPCAO')) {
                navigate('/recepcao');
            } else {
                navigate('/dashboard');
            }
        } catch (error: any) {
            console.error("Erro no login:", error);
            if (error.response?.data?.message) {
                setServerError(error.response.data.message);
            } else if (error.response?.status === 401) {
                setServerError('Usuário ou senha inválidos.');
            } else {
                setServerError('Falha ao tentar fazer login. Verifique sua conexão ou tente novamente mais tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login do Operador</CardTitle>
                    <CardDescription className="text-center">
                        Acesse o painel de gestão do sistema.
                    </CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleLoginSubmit)}>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="login"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="loginInput">Login</Label>
                                        <FormControl>
                                            <Input
                                                id="loginInput"
                                                placeholder="Seu login de usuário"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="senha"
                                render={({ field }) => (
                                    <FormItem>
                                        <Label htmlFor="senhaInput">Senha</Label>
                                        <FormControl>
                                            <Input
                                                id="senhaInput"
                                                type="password"
                                                placeholder="Sua senha"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {serverError && (
                                <p className="text-sm font-medium text-destructive">
                                    {serverError}
                                </p>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    'Entrar'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>
        </div>
    );
}
