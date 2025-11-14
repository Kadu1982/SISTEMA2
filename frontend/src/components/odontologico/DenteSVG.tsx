import React from "react";
import type { Dente } from "@/types/odontologia";
import { CORES_TRATAMENTO } from "@/types/odontologia";

interface DenteSVGProps {
    dente: Dente;
    size?: number;
    onClick?: () => void;
    className?: string;
}

/**
 * Componente SVG que renderiza um dente realista
 * Baseado no visual do Simples Dental - formato anatômico com coroa e raízes
 */
const DenteSVG: React.FC<DenteSVGProps> = ({
    dente,
    size = 60,
    onClick,
    className = "",
}) => {
    // Determina se o dente é molar (tem coroa mais larga e raízes duplas)
    const isMolar = [16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48].includes(dente.numero);

    // Determina se é pré-molar (coroa média)
    const isPreMolar = [14, 15, 24, 25, 34, 35, 44, 45].includes(dente.numero);

    // Determina se é canino (coroa pontiaguda)
    const isCanino = [13, 23, 33, 43].includes(dente.numero);

    // Dimensões baseadas no tipo de dente
    const width = isMolar ? size * 0.5 : isPreMolar ? size * 0.42 : isCanino ? size * 0.35 : size * 0.32;
    const coroaHeight = size * 0.45;
    const raizHeight = size * 0.4;
    const height = coroaHeight + raizHeight;

    const centerX = size / 2;

    // Cria path da coroa baseado no tipo de dente
    const getCoroaPath = () => {
        const halfWidth = width / 2;

        if (isMolar) {
            // Molares: formato quadrado/retangular com cúspides
            return `
                M ${centerX - halfWidth} ${coroaHeight * 0.15}
                L ${centerX - halfWidth * 0.7} ${0}
                L ${centerX - halfWidth * 0.3} ${coroaHeight * 0.05}
                L ${centerX + halfWidth * 0.3} ${coroaHeight * 0.05}
                L ${centerX + halfWidth * 0.7} ${0}
                L ${centerX + halfWidth} ${coroaHeight * 0.15}
                L ${centerX + halfWidth} ${coroaHeight}
                L ${centerX - halfWidth} ${coroaHeight}
                Z
            `;
        } else if (isPreMolar) {
            // Pré-molares: formato ovalado com duas cúspides
            return `
                M ${centerX - halfWidth} ${coroaHeight * 0.25}
                L ${centerX - halfWidth * 0.4} ${coroaHeight * 0.05}
                L ${centerX} ${0}
                L ${centerX + halfWidth * 0.4} ${coroaHeight * 0.05}
                L ${centerX + halfWidth} ${coroaHeight * 0.25}
                Q ${centerX + halfWidth} ${coroaHeight * 0.6} ${centerX + halfWidth * 0.8} ${coroaHeight}
                L ${centerX - halfWidth * 0.8} ${coroaHeight}
                Q ${centerX - halfWidth} ${coroaHeight * 0.6} ${centerX - halfWidth} ${coroaHeight * 0.25}
                Z
            `;
        } else if (isCanino) {
            // Caninos: formato pontiagudo
            return `
                M ${centerX - halfWidth} ${coroaHeight * 0.3}
                L ${centerX} ${0}
                L ${centerX + halfWidth} ${coroaHeight * 0.3}
                Q ${centerX + halfWidth} ${coroaHeight * 0.7} ${centerX + halfWidth * 0.7} ${coroaHeight}
                L ${centerX - halfWidth * 0.7} ${coroaHeight}
                Q ${centerX - halfWidth} ${coroaHeight * 0.7} ${centerX - halfWidth} ${coroaHeight * 0.3}
                Z
            `;
        } else {
            // Incisivos: formato retangular fino com borda superior reta
            return `
                M ${centerX - halfWidth} ${coroaHeight * 0.1}
                L ${centerX - halfWidth} ${0}
                L ${centerX + halfWidth} ${0}
                L ${centerX + halfWidth} ${coroaHeight * 0.1}
                L ${centerX + halfWidth} ${coroaHeight * 0.9}
                Q ${centerX + halfWidth} ${coroaHeight} ${centerX + halfWidth * 0.8} ${coroaHeight}
                L ${centerX - halfWidth * 0.8} ${coroaHeight}
                Q ${centerX - halfWidth} ${coroaHeight} ${centerX - halfWidth} ${coroaHeight * 0.9}
                Z
            `;
        }
    };

    // Cria paths das raízes
    const getRaizesPath = () => {
        const raizWidth = isMolar ? width * 0.3 : width * 0.4;
        const raizGap = width * 0.15;

        if (isMolar) {
            // Molares: 2-3 raízes visíveis
            const raiz1X = centerX - raizWidth - raizGap / 2;
            const raiz2X = centerX + raizGap / 2;

            return [
                // Raiz esquerda
                `M ${raiz1X} ${coroaHeight}
                 L ${raiz1X} ${coroaHeight + raizHeight * 0.8}
                 Q ${raiz1X} ${coroaHeight + raizHeight} ${raiz1X + raizWidth * 0.2} ${coroaHeight + raizHeight}
                 L ${raiz1X + raizWidth * 0.8} ${coroaHeight + raizHeight}
                 Q ${raiz1X + raizWidth} ${coroaHeight + raizHeight} ${raiz1X + raizWidth} ${coroaHeight + raizHeight * 0.8}
                 L ${raiz1X + raizWidth} ${coroaHeight}
                 Z`,
                // Raiz direita
                `M ${raiz2X} ${coroaHeight}
                 L ${raiz2X} ${coroaHeight + raizHeight * 0.8}
                 Q ${raiz2X} ${coroaHeight + raizHeight} ${raiz2X + raizWidth * 0.2} ${coroaHeight + raizHeight}
                 L ${raiz2X + raizWidth * 0.8} ${coroaHeight + raizHeight}
                 Q ${raiz2X + raizWidth} ${coroaHeight + raizHeight} ${raiz2X + raizWidth} ${coroaHeight + raizHeight * 0.8}
                 L ${raiz2X + raizWidth} ${coroaHeight}
                 Z`
            ];
        } else {
            // Outros dentes: 1 raiz central
            const raizX = centerX - raizWidth / 2;
            return [
                `M ${raizX} ${coroaHeight}
                 L ${raizX + raizWidth * 0.2} ${coroaHeight + raizHeight * 0.9}
                 Q ${raizX + raizWidth * 0.3} ${coroaHeight + raizHeight} ${raizX + raizWidth * 0.5} ${coroaHeight + raizHeight}
                 Q ${raizX + raizWidth * 0.7} ${coroaHeight + raizHeight} ${raizX + raizWidth * 0.8} ${coroaHeight + raizHeight * 0.9}
                 L ${raizX + raizWidth} ${coroaHeight}
                 Z`
            ];
        }
    };

    // Círculo oclusal (vista de cima) para molares e pré-molares
    const getCirculoOclusal = () => {
        if (!isMolar && !isPreMolar) return null;

        const radius = width * 0.15;
        return (
            <ellipse
                cx={centerX}
                cy={coroaHeight * 0.35}
                rx={radius * 1.2}
                ry={radius * 0.8}
                fill="none"
                stroke="#d0d0d0"
                strokeWidth="0.8"
            />
        );
    };

    const coroaPath = getCoroaPath();
    const raizesPaths = getRaizesPath();

    return (
        <div className="flex flex-col items-center">
            <svg
                width={size}
                height={height + 15}
                viewBox={`0 0 ${size} ${height + 15}`}
                className={`cursor-pointer transition-all hover:scale-105 ${className}`}
                onClick={onClick}
            >
                {/* Grupo principal do dente */}
                <g>
                    {/* Raízes - renderizadas primeiro (atrás) */}
                    {raizesPaths.map((path, idx) => (
                        <path
                            key={`raiz-${idx}`}
                            d={path}
                            fill="#f5f5f5"
                            stroke="#d0d0d0"
                            strokeWidth="1"
                            opacity={dente.estado === "perdido" || dente.estado === "ausente" ? 0.3 : 0.95}
                        />
                    ))}

                    {/* Coroa do dente */}
                    <path
                        d={coroaPath}
                        fill="white"
                        stroke="#d0d0d0"
                        strokeWidth="1.2"
                        opacity={dente.estado === "perdido" || dente.estado === "ausente" ? 0.3 : 1}
                    />

                    {/* Círculo oclusal para molares/pré-molares */}
                    {getCirculoOclusal()}

                    {/* Indicadores de estado - pequenos círculos coloridos */}
                    {dente.estado !== "sadio" && dente.estado !== "perdido" && dente.estado !== "ausente" && (
                        <circle
                            cx={centerX}
                            cy={coroaHeight * 0.4}
                            r={size * 0.08}
                            fill={CORES_TRATAMENTO[dente.estado]}
                            opacity="0.85"
                        />
                    )}

                    {/* Indicador de ausência/perdido (X vermelho) */}
                    {(dente.estado === "perdido" || dente.estado === "ausente") && (
                        <g>
                            <line
                                x1={centerX - width * 0.3}
                                y1={coroaHeight * 0.2}
                                x2={centerX + width * 0.3}
                                y2={coroaHeight * 0.8}
                                stroke="#dc2626"
                                strokeWidth="2.5"
                                opacity="0.9"
                                strokeLinecap="round"
                            />
                            <line
                                x1={centerX + width * 0.3}
                                y1={coroaHeight * 0.2}
                                x2={centerX - width * 0.3}
                                y2={coroaHeight * 0.8}
                                stroke="#dc2626"
                                strokeWidth="2.5"
                                opacity="0.9"
                                strokeLinecap="round"
                            />
                        </g>
                    )}
                </g>

                {/* Número do dente - abaixo do desenho */}
                <text
                    x={centerX}
                    y={height + 12}
                    textAnchor="middle"
                    fontSize={size * 0.18}
                    fontWeight="600"
                    fill="#374151"
                >
                    {dente.numero}
                </text>
            </svg>
        </div>
    );
};

export default DenteSVG;
