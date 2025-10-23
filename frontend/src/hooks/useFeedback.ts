import { useState } from 'react';

interface MensagemFeedback {
    tipo: 'success' | 'error' | null;
    texto: string;
}

export const useFeedback = () => {
    const [mensagemFeedback, setMensagemFeedback] = useState<MensagemFeedback>({
        tipo: null,
        texto: ''
    });

    const mostrarFeedback = (tipo: 'success' | 'error', texto: string) => {
        setMensagemFeedback({ tipo, texto });
        setTimeout(() => {
            setMensagemFeedback({ tipo: null, texto: '' });
        }, 3000);
    };

    const limparFeedback = () => {
        setMensagemFeedback({ tipo: null, texto: '' });
    };

    return { mensagemFeedback, mostrarFeedback, limparFeedback };
};