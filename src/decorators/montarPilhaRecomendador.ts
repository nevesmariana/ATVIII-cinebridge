import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { CacheDecorator } from './CacheDecorator';
import { CompressaoDecorator } from './CompressaoDecorator';
import {
    AuditoriaDecorator,
    RegistradorAuditoria,
    RegistradorAuditoriaConsole
} from './AuditoriaDecorator';

export type NomeDecorador = 'cache' | 'auditoria' | 'compressao';

const NOMES_VALIDOS: readonly NomeDecorador[] = [
    'cache',
    'auditoria',
    'compressao'
];

export interface OpcoesPilha {
    registrador?: RegistradorAuditoria;
    ttlCacheMs?: number;
}

export interface PilhaRecomendador {
    topo: RecomendacaoStrategy;
    cache?: CacheDecorator;
    compressao?: CompressaoDecorator;
}

function validarNomes(nomes: readonly string[]): NomeDecorador[] {
    const vistos = new Set<string>();
    for (const nome of nomes) {
        if (!NOMES_VALIDOS.includes(nome as NomeDecorador)) {
            throw new Error(
                `Decorador desconhecido: '${nome}'. ` +
                `Validos: ${NOMES_VALIDOS.join(', ')}`
            );
        }
        if (vistos.has(nome)) {
            throw new Error(`Decorador repetido: '${nome}'`);
        }
        vistos.add(nome);
    }
    return nomes as NomeDecorador[];
}

export function lerDecoradoresConfigurados(
    texto: string | undefined
): NomeDecorador[] {
    if (!texto || texto.trim().length === 0) {
        return [];
    }
    const nomes = texto
        .split(',')
        .map((n) => n.trim().toLowerCase())
        .filter((n) => n.length > 0);
    return validarNomes(nomes);
}

export function montarPilhaRecomendador(
    base: RecomendacaoStrategy,
    nomes: readonly string[],
    opcoes: OpcoesPilha = {}
): PilhaRecomendador {
    const pilha: PilhaRecomendador = { topo: base };
    let atual = base;

    for (const nome of validarNomes(nomes)) {
        switch (nome) {
            case 'cache': {
                const cache = new CacheDecorator(atual, opcoes.ttlCacheMs);
                pilha.cache = cache;
                atual = cache;
                break;
            }
            case 'auditoria':
                atual = new AuditoriaDecorator(
                    atual,
                    opcoes.registrador ?? new RegistradorAuditoriaConsole()
                );
                break;
            case 'compressao': {
                const compressao = new CompressaoDecorator(atual);
                pilha.compressao = compressao;
                atual = compressao;
                break;
            }
        }
    }

    pilha.topo = atual;
    return pilha;
}