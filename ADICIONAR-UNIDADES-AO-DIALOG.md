# 🏥 Guia: Adicionar Seleção de Unidades ao Dialog de Criação de Operador

## 📋 Mudanças Necessárias

### 1. Importar Serviço de Unidades

```typescript
// No início do CriarOperadorDialog.tsx, adicione:
import { listarUnidades, UnidadeDTO } from '@/services/unidadesService';
import { Checkbox } from '@/components/ui/checkbox';
import { Building2 } from 'lucide-react';
```

### 2. Adicionar Estados para Unidades

```typescript
export function CriarOperadorDialog({ aberto, onFechar, onCriado }: CriarOperadorDialogProps) {
    // ... estados existentes ...

    // NOVO: Estados para unidades
    const [unidadesDisponiveis, setUnidadesDisponiveis] = useState<UnidadeDTO[]>([]);
    const [unidadesSelecionadas, setUnidadesSelecionadas] = useState<number[]>([]);
    const [unidadePrincipal, setUnidadePrincipal] = useState<number | null>(null);
    const [carregandoUnidades, setCarregandoUnidades] = useState(true);

    // ...
}
```

###3. Carregar Unidades ao Abrir Dialog

```typescript
useEffect(() => {
    if (aberto) {
        carregarPerfis();
        carregarUnidades(); // NOVO
    }
}, [aberto]);

const carregarUnidades = async () => {
    setCarregandoUnidades(true);
    try {
        const response = await listarUnidades();
        // listarUnidades retorna { content: UnidadeDTO[], ... }
        setUnidadesDisponiveis(response.content || []);
    } catch (error) {
        console.error('Erro ao carregar unidades:', error);
    } finally {
        setCarregandoUnidades(false);
    }
};
```

### 4. Funções para Gerenciar Unidades

```typescript
const toggleUnidade = (unidadeId: number) => {
    if (unidadesSelecionadas.includes(unidadeId)) {
        // Remover
        setUnidadesSelecionadas(unidadesSelecionadas.filter(id => id !== unidadeId));
        // Se era a principal, limpar
        if (unidadePrincipal === unidadeId) {
            setUnidadePrincipal(null);
        }
    } else {
        // Adicionar
        setUnidadesSelecionadas([...unidadesSelecionadas, unidadeId]);
        // Se é a primeira, definir como principal
        if (unidadesSelecionadas.length === 0) {
            setUnidadePrincipal(unidadeId);
        }
    }
};

const definirComoPrincipal = (unidadeId: number) => {
    if (unidadesSelecionadas.includes(unidadeId)) {
        setUnidadePrincipal(unidadeId);
    }
};
```

### 5. Atualizar Validação

```typescript
const criarOperador = async () => {
    // ... validações existentes ...

    if (unidadesSelecionadas.length === 0) {
        setErro('Selecione pelo menos uma unidade de saúde');
        return;
    }

    if (!unidadePrincipal) {
        setErro('Defina uma unidade principal');
        return;
    }

    // ... resto do código ...
}
```

### 6. Criar Operador com Unidades

```typescript
const criarOperador = async () => {
    // ... validações ...

    setSalvando(true);
    setErro('');

    try {
        // 1. Criar operador com unidade principal
        const operadorCriado = await operadoresService.criar({
            nome,
            login,
            senha,
            cpf,
            email: email || undefined,
            ativo: true,
            unidadeId: unidadePrincipal, // ⭐ UNIDADE PRINCIPAL
            perfis: [],
        });

        // 2. Adicionar perfis
        await operadoresService.salvarPerfis(operadorCriado.id!, perfisSelecionados);

        // 3. Adicionar todas as unidades (incluindo a principal)
        await operadoresService.salvarUnidadesDoOperador(
            operadorCriado.id!,
            unidadesSelecionadas // ⭐ TODAS AS UNIDADES
        );

        // Limpar e fechar
        limparFormulario();
        onCriado();
        onFechar();

    } catch (error: any) {
        setErro(error.message || 'Erro ao criar operador');
    } finally {
        setSalvando(false);
    }
};

const limparFormulario = () => {
    setNome('');
    setLogin('');
    setSenha('');
    setCpf('');
    setEmail('');
    setPerfisSelecionados([]);
    setUnidadesSelecionadas([]); // NOVO
    setUnidadePrincipal(null); // NOVO
};
```

### 7. Adicionar Seção de Unidades no JSX

```tsx
<div className="space-y-6 py-4">
    {/* ... Dados Básicos ... */}

    {/* ... Perfis ... */}

    {/* NOVA SEÇÃO: Unidades de Saúde */}
    <div className="space-y-4">
        <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            <h3 className="font-semibold text-sm">Unidades de Saúde</h3>
        </div>

        <p className="text-sm text-muted-foreground">
            Selecione as unidades onde o operador pode atuar. A unidade marcada como
            "Principal" será a unidade padrão do operador.
        </p>

        {/* Lista de unidades com checkboxes */}
        <div className="border rounded divide-y max-h-64 overflow-y-auto">
            {carregandoUnidades ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                    Carregando unidades...
                </div>
            ) : unidadesDisponiveis.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma unidade de saúde cadastrada
                </div>
            ) : (
                unidadesDisponiveis.map((unidade) => {
                    const selecionada = unidadesSelecionadas.includes(unidade.id!);
                    const ehPrincipal = unidadePrincipal === unidade.id;

                    return (
                        <div
                            key={unidade.id}
                            className={`flex items-center justify-between p-3 hover:bg-muted/50 ${
                                ehPrincipal ? 'bg-primary/5 border-l-2 border-primary' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <Checkbox
                                    checked={selecionada}
                                    onCheckedChange={() => toggleUnidade(unidade.id!)}
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-sm">
                                        {unidade.nome || unidade.razaoSocial}
                                        {ehPrincipal && (
                                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                                                Principal
                                            </span>
                                        )}
                                    </div>
                                    {unidade.tipo && (
                                        <div className="text-xs text-muted-foreground">
                                            Tipo: {unidade.tipo}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selecionada && !ehPrincipal && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => definirComoPrincipal(unidade.id!)}
                                >
                                    Definir como Principal
                                </Button>
                            )}
                        </div>
                    );
                })
            )}
        </div>

        {/* Resumo */}
        {unidadesSelecionadas.length > 0 && (
            <div className="text-sm bg-muted/50 p-3 rounded">
                <strong>{unidadesSelecionadas.length}</strong> unidade(s) selecionada(s)
                {unidadePrincipal && (
                    <div className="text-muted-foreground mt-1">
                        Unidade principal:{' '}
                        {unidadesDisponiveis.find(u => u.id === unidadePrincipal)?.nome || 'N/A'}
                    </div>
                )}
            </div>
        )}
    </div>

    {/* ... Erro ... */}
</div>
```

---

## 🎯 Resultado Final

### Estrutura de Dados Criada:

#### 1. Tabela: `operador`
```sql
id | login | nome | unidade_saude_id (principal) | ativo
---|-------|------|------------------------------|-------
10 | joao  | João | 5                           | true
```

#### 2. Tabela: `operador_perfis`
```sql
operador_id | perfil
------------|-------
10          | UPA
10          | Enfermeiro UPA
```

#### 3. Tabela: `operador_unidades` ⭐ NOVA
```sql
operador_id | unidade_id
------------|------------
10          | 5  (principal)
10          | 7  (secundária)
10          | 12 (secundária)
```

---

## ✅ Checklist de Implementação

- [ ] Importar serviço de unidades
- [ ] Adicionar estados para unidades
- [ ] Carregar unidades ao abrir dialog
- [ ] Implementar toggle de seleção
- [ ] Implementar definição de unidade principal
- [ ] Atualizar validação (mínimo 1 unidade)
- [ ] Salvar unidade principal no operador
- [ ] Salvar todas as unidades em operador_unidades
- [ ] Adicionar seção de UI com checkboxes
- [ ] Mostrar resumo de unidades selecionadas
- [ ] Destacar unidade principal visualmente
- [ ] Testar criação completa

---

## 🔄 Fluxo Completo

```
1. Usuário abre "Novo Operador"
   ↓
2. Preenche dados básicos
   ↓
3. Seleciona perfis (UPA, Enfermeiro, etc.)
   ↓
4. ⭐ Seleciona unidades (múltiplas via checkbox)
   ↓
5. ⭐ Define uma como principal
   ↓
6. Clica "Criar Operador"
   ↓
7. Sistema cria:
   - Operador com unidade_saude_id (principal)
   - operador_perfis (todos os perfis)
   - operador_unidades (todas as unidades)
   ↓
8. Operador pode fazer login
   ↓
9. Menu mostra módulos dos perfis
   ↓
10. ⭐ Visualizações filtradas por unidade
```

---

## 🎨 Visual da Seção de Unidades

```
┌─────────────────────────────────────────────┐
│ 🏥 Unidades de Saúde                        │
├─────────────────────────────────────────────┤
│ Selecione as unidades onde o operador...   │
│                                              │
│ ┌─────────────────────────────────────────┐│
│ │ ☑ UPA Centro                  Principal││
│ │   Tipo: UPA                             ││
│ ├─────────────────────────────────────────┤│
│ │ ☑ UBS Jardim         [Definir Principal]││
│ │   Tipo: UBS                             ││
│ ├─────────────────────────────────────────┤│
│ │ ☐ Hospital Municipal                    ││
│ │   Tipo: HOSPITAL                        ││
│ └─────────────────────────────────────────┘│
│                                              │
│ 📊 2 unidade(s) selecionada(s)              │
│    Unidade principal: UPA Centro            │
└─────────────────────────────────────────────┘
```

---

## 🎯 Validações Implementadas

1. ✅ Pelo menos 1 unidade deve ser selecionada
2. ✅ Deve haver uma unidade principal definida
3. ✅ Unidade principal deve estar na lista de selecionadas
4. ✅ Ao desmarcar unidade principal, limpar seleção
5. ✅ Primeira unidade selecionada vira principal automaticamente

---

## 📊 Como as Permissões Funcionam com Unidades

### Exemplo: Operador João

**Perfis:** UPA, Enfermeiro UPA
**Unidades:** UPA Centro (principal), UBS Jardim, Hospital Municipal

**O que ele vê:**
- ✅ Menu mostra "UPA" (porque tem perfil UPA)
- ✅ Pode acessar módulo UPA em todas as 3 unidades
- ✅ Dados filtrados por unidade (cada unidade mostra seus próprios pacientes/atendimentos)
- ✅ Pode trocar de unidade no sistema
- ✅ Unidade principal é a padrão ao fazer login

---

## 🚀 Próximos Passos

Depois de implementar, teste:

1. **Criar operador com 1 unidade**
2. **Criar operador com múltiplas unidades**
3. **Fazer login com operador criado**
4. **Verificar se menu UPA aparece**
5. **Verificar se dados são filtrados por unidade**
6. **Trocar de unidade (se houver funcionalidade)**

---

**Agora o operador estará completamente configurado com perfis E unidades!** 🎉
