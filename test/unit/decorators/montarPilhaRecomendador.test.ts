import { RecomendadorBase } from '../../../src/strategies/RecomendadorBase';
import { RegistradorAuditoriaMemoria } from '../../../src/decorators/AuditoriaDecorator';
import {
    lerDecoradoresConfigurados,
    montarPilhaRecomendador
} from '../../../src/decorators/montarPilhaRecomendador';
import { Projeto } from '../../../src/domain/Projeto';
import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Papel } from '../../../src/domain/Papel';

const projeto = () =>
    new Projeto('p1', 'ficcao', 90, 50000, new Date('2035-01-01'), [
        { papel: Papel.DIRETOR, peso: 1 }
    ]);

const profs = () => [
    new Profissional(
        'a', 'Ana',
        [new Competencia('direcao', 9), new Competencia('lideranca', 8)],
        new Intervalo(new Date('2026-01-01'), new Date('2100-01-01')),
        3000
    )
];

describe('lerDecoradoresConfigurados', () => {
    it('le uma lista separada por virgulas, ignorando espacos e maiusculas', () => {
        expect(lerDecoradoresConfigurados(' Cache , AUDITORIA,compressao '))
            .toEqual(['cache', 'auditoria', 'compressao']);
    });

    it.each([[undefined], [''], ['   ']])('texto vazio (%p) = sem decoradores', (texto) => {
        expect(lerDecoradoresConfigurados(texto)).toEqual([]);
    });

    it('rejeita nome desconhecido e nome repetido', () => {
        expect(() => lerDecoradoresConfigurados('cache,logs')).toThrow("desconhecido: 'logs'");
        expect(() => lerDecoradoresConfigurados('cache,cache')).toThrow("repetido: 'cache'");
    });
});

describe('montarPilhaRecomendador', () => {
    it('sem decoradores devolve o proprio recomendador base', () => {
        const base = new RecomendadorBase();
        expect(montarPilhaRecomendador(base, []).topo).toBe(base);
    });

    it('expoe cache e compressao quando fazem parte da pilha', () => {
        const pilha = montarPilhaRecomendador(
            new RecomendadorBase(),
            ['cache', 'compressao'],
            { registrador: new RegistradorAuditoriaMemoria() }
        );
        expect(pilha.cache).toBeDefined();
        expect(pilha.compressao).toBeDefined();

        const semNada = montarPilhaRecomendador(new RecomendadorBase(), ['auditoria'], {
            registrador: new RegistradorAuditoriaMemoria()
        });
        expect(semNada.cache).toBeUndefined();
        expect(semNada.compressao).toBeUndefined();
    });

    it('a ordem dos nomes define a ordem das camadas (primeiro = mais interno)', () => {
        const a = new RegistradorAuditoriaMemoria();
        const cacheDentro = montarPilhaRecomendador(new RecomendadorBase(), ['cache', 'auditoria'], { registrador: a });
        cacheDentro.topo.recomendar(projeto(), profs());
        cacheDentro.topo.recomendar(projeto(), profs());
        expect(a.entradas).toHaveLength(2);

        const b = new RegistradorAuditoriaMemoria();
        const cacheFora = montarPilhaRecomendador(new RecomendadorBase(), ['auditoria', 'cache'], { registrador: b });
        cacheFora.topo.recomendar(projeto(), profs());
        cacheFora.topo.recomendar(projeto(), profs());
        expect(b.entradas).toHaveLength(1);
    });

    it('rejeita nomes invalidos', () => {
        expect(() => montarPilhaRecomendador(new RecomendadorBase(), ['x'])).toThrow('desconhecido');
        expect(() => montarPilhaRecomendador(new RecomendadorBase(), ['cache', 'cache'])).toThrow('repetido');
    });

    it('respeita o TTL informado nas opcoes', () => {
        const pilha = montarPilhaRecomendador(new RecomendadorBase(), ['cache'], { ttlCacheMs: 0 });
        pilha.topo.recomendar(projeto(), profs());
        pilha.topo.recomendar(projeto(), profs());
        expect(pilha.cache!.estatisticas().acertos).toBe(0);
    });
});