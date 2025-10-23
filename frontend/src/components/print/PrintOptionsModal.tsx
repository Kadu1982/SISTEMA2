/**
 * src/components/print/PrintOptionsModal.tsx
 * Modal leve para escolher documentos a imprimir ao finalizar atendimento.
 * Design discreto (Tailwind / sua UI base), sem interferir na identidade.
 */
import React, { useEffect, useState } from "react";

export type PrintOptionKey = "ATESTADO" | "RECEITUARIO" | "FICHA";

type Option = {
    key: PrintOptionKey;
    label: string;
    checked?: boolean;
    disabled?: boolean;
    hint?: string;
    onPrint: () => Promise<void>;
};

type Props = {
    open: boolean;
    title?: string;
    options: Option[];
    onClose: () => void;
};

const PrintOptionsModal: React.FC<Props> = ({ open, title = "Impressões ao finalizar", options, onClose }) => {
    const [items, setItems] = useState<Option[]>(options);

    useEffect(() => { setItems(options); }, [open, options]);

    async function handlePrint() {
        for (const it of items) {
            if (it.checked && !it.disabled) {
                try { await it.onPrint(); } catch (e) { console.error(`Falha ao imprimir ${it.label}:`, e); }
            }
        }
        onClose();
    }

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-2xl bg-zinc-900 text-zinc-100 shadow-xl p-6">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>

                <div className="space-y-3 mb-6">
                    {items.map((it, idx) => (
                        <label key={it.key} className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                className="h-4 w-4 mt-1"
                                checked={!!it.checked}
                                disabled={it.disabled}
                                onChange={(e) => {
                                    const next = [...items];
                                    next[idx] = { ...next[idx], checked: e.target.checked };
                                    setItems(next);
                                }}
                            />
                            <div>
                                <div className={`${it.disabled ? "opacity-60" : ""}`}>{it.label}</div>
                                {it.hint && <div className="text-xs text-zinc-400">{it.hint}</div>}
                            </div>
                        </label>
                    ))}
                </div>

                <div className="flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600 transition">Cancelar</button>
                    <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition font-semibold">
                        Imprimir selecionados
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintOptionsModal;
