import { RecomendacaoStrategy } from '../../../src/strategies/RecomendacaoStrategy';
import { RecomendadorBase } from '../../../src/strategies/RecomendadorBase';
import { CacheDecorator } from '../../../src/decorators/CacheDecorator';
import {
    AuditoriaDecorator,
    RegistradorAuditoriaMemoria
} from '../../../src/decorators/AuditoriaDecorator';
import { CompressaoDecorator } from '../../../src/decorators/CompressaoDecorator';
import { Projeto } from '../../../src/domain/Projeto';
import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Avaliacao } from '../../../src/domain/Avaliacao';
import { Papel } from '../../../src/domain/Papel';

function profissional(id: string, nivel = 9, preco = 3000): Profissional {
    return new Profissional(
        id,
        `Pessoa ${id}`,
        [
            new Competencia('direcao', nivel),
            new Competencia('lideranca', nivel),
            new Competencia('narrativa', nivel)
        ],
        new Intervalo(new Date('2026-01-01'), new Date('2100-01-01')),
        preco
    );
}

function projeto(id = 'p1', orcamento = 50000): Projeto {
    return new Projeto(id, 'ficcao', 90, orcamento, new Date('2035-01-01'), [
        { papel: Papel.DIRETOR, peso: 1 }
    ]);
}

class RecomendadorLento implements RecomendacaoStrategy {
    chamadas = 0;
    private readonly real = new RecomendadorBase();

    constructor(private readonly atrasoMs: number) { }

    recomendar(p: Projeto, profs: Profissional[]) {
        this.chamadas += 1;
        const fim = Date.now() + this.atrasoMs;
        while (Date.now() < fim) { /* simula processamento pesado */ }
        return this.real.recomendar(p, profs);
    }
}

describe('RecomendadorBase', () => {
    it('recomenda como a estrategia da Atividade 1', () => {
        const r = new RecomendadorBase().recomendar(projeto(), [profissional('a')]);
        expect(r.get(Papel.DIRETOR)?.map((p) => p.id)).toEqual(['a']);
    });
});

describe('CacheDecorator', () => {
    it('repeticao nao chama o recomendador interno de novo', () => {
        const lento = new RecomendadorLento(0);
        const cache = new CacheDecorator(lento);
        const profs = [profissional('a'), profissional('b', 5)];

        const r1 = cache.recomendar(projeto(), profs);
        const r2 = cache.recomendar(projeto(), profs);

        expect(lento.chamadas).toBe(1);
        expect(r2.get(Papel.DIRETOR)?.map((p) => p.id))
            .toEqual(r1.get(Papel.DIRETOR)?.map((p) => p.id));
        expect(cache.estatisticas()).toEqual({ acertos: 1, falhas: 1, entradas: 1 });
    });

    it('reduz o tempo de resposta em requisicoes repetidas', () => {
        const cache = new CacheDecorator(new RecomendadorLento(40));
        const profs = [profissional('a')];

        const t1 = Date.now();
        cache.recomendar(projeto(), profs);
        const primeira = Date.now() - t1;

        const t2 = Date.now();
        cache.recomendar(projeto(), profs);
        const segunda = Date.now() - t2;

        expect(primeira).toBeGreaterThanOrEqual(35);
        expect(segunda).toBeLessThan(primeira / 4);
    });

    it('projetos similares (outro id, mesmos requisitos) compartilham o cache', () => {
        const lento = new RecomendadorLento(0);
        const cache = new CacheDecorator(lento);
        const profs = [profissional('a')];
        cache.recomendar(projeto('p1'), profs);
        cache.recomendar(projeto('p2'), profs);
        expect(lento.chamadas).toBe(1);
    });

    it('entrada diferente (orcamento ou candidatos) nao reaproveita o cache', () => {
        const lento = new RecomendadorLento(0);
        const cache = new CacheDecorator(lento);
        cache.recomendar(projeto('p1', 50000), [profissional('a')]);
        cache.recomendar(projeto('p1', 90000), [profissional('a')]);
        cache.recomendar(projeto('p1', 50000), [profissional('a'), profissional('b')]);
        expect(lento.chamadas).toBe(3);
    });

    it('nova avaliacao muda a chave (nao devolve resultado velho)', () => {
        const lento = new RecomendadorLento(0);
        const cache = new CacheDecorator(lento);
        const a = profissional('a');
        cache.recomendar(projeto(), [a]);
        a.recebe(new Avaliacao(9, 'otimo', new Date()));
        cache.recomendar(projeto(), [a]);
        expect(lento.chamadas).toBe(2);
    });

    it('entradas expiram apos o TTL', () => {
        let agora = 1000;
        const lento = new RecomendadorLento(0);
        const cache = new CacheDecorator(lento, 500, () => agora);
        const profs = [profissional('a')];

        cache.recomendar(projeto(), profs);
        agora += 499;
        cache.recomendar(projeto(), profs);
        expect(lento.chamadas).toBe(1);

        agora += 2;
        cache.recomendar(projeto(), profs);
        expect(lento.chamadas).toBe(2);
    });

    it('alterar o resultado devolvido nao corrompe o cache', () => {
        const cache = new CacheDecorator(new RecomendadorBase());
        const profs = [profissional('a')];
        cache.recomendar(projeto(), profs).get(Papel.DIRETOR)?.pop();
        expect(cache.recomendar(projeto(), profs).get(Papel.DIRETOR)).toHaveLength(1);
    });

    it('limpar() esvazia o cache', () => {
        const cache = new CacheDecorator(new RecomendadorBase());
        cache.recomendar(projeto(), [profissional('a')]);
        cache.limpar();
        expect(cache.estatisticas().entradas).toBe(0);
    });
});

describe('AuditoriaDecorator', () => {
    it('registra cada chamada com projeto, candidatos e duracao', () => {
        const registro = new RegistradorAuditoriaMemoria();
        const auditado = new AuditoriaDecorator(new RecomendadorBase(), registro);

        auditado.recomendar(projeto('p1'), [profissional('a'), profissional('b')]);
        auditado.recomendar(projeto('p2'), [profissional('a')]);

        expect(registro.entradas).toHaveLength(2);
        expect(registro.entradas[0]).toMatchObject({
            projetoId: 'p1', candidatos: 2, papeisRecomendados: 1, sucesso: true
        });
        expect(registro.entradas[1].projetoId).toBe('p2');
        expect(registro.entradas[0].duracaoMs).toBeGreaterThanOrEqual(0);
    });

    it('registra falhas e relanca o erro', () => {
        const registro = new RegistradorAuditoriaMemoria();
        const quebrado: RecomendacaoStrategy = {
            recomendar() { throw new Error('falhou'); }
        };
        const auditado = new AuditoriaDecorator(quebrado, registro);

        expect(() => auditado.recomendar(projeto(), [])).toThrow('falhou');
        expect(registro.entradas[0]).toMatchObject({ sucesso: false, erro: 'falhou' });
    });
});

describe('CompressaoDecorator', () => {
    const muitos = Array.from({ length: 40 }, (_, i) => profissional(`p${i}`));

    it('gera pacote menor que o original e devolve o mesmo resultado', () => {
        const comp = new CompressaoDecorator(new RecomendadorBase());
        const resultado = comp.recomendar(projeto(), muitos);
        const pacote = comp.ultimoPacote()!;

        expect(resultado.get(Papel.DIRETOR)).toHaveLength(40);
        expect(pacote.tamanhoComprimido).toBeLessThan(pacote.tamanhoOriginal / 2);
        expect(pacote.dados.length).toBe(pacote.tamanhoComprimido);
    });

    it('o pacote descomprime de volta para os mesmos dados', () => {
        const comp = new CompressaoDecorator(new RecomendadorBase());
        comp.recomendar(projeto(), muitos);
        const volta = CompressaoDecorator.descomprimir(comp.ultimoPacote()!.dados);

        expect(volta).toHaveLength(1);
        expect(volta[0].papel).toBe(Papel.DIRETOR);
        expect(volta[0].profissionais).toHaveLength(40);
        expect(volta[0].profissionais[0].id).toBe('p0');
    });

    it('ainda nao ha pacote antes da primeira chamada', () => {
        expect(new CompressaoDecorator(new RecomendadorBase()).ultimoPacote()).toBeNull();
    });
});

describe('Decoradores combinados: a ORDEM muda o comportamento', () => {
    it('auditoria por fora do cache registra todas as chamadas', () => {
        const registro = new RegistradorAuditoriaMemoria();
        const lento = new RecomendadorLento(0);
        const pilha = new AuditoriaDecorator(new CacheDecorator(lento), registro);

        pilha.recomendar(projeto(), [profissional('a')]);
        pilha.recomendar(projeto(), [profissional('a')]);

        expect(registro.entradas).toHaveLength(2);
        expect(lento.chamadas).toBe(1);
    });

    it('auditoria por dentro do cache registra so os acessos que o cache nao resolveu', () => {
        const registro = new RegistradorAuditoriaMemoria();
        const lento = new RecomendadorLento(0);
        const pilha = new CacheDecorator(new AuditoriaDecorator(lento, registro));

        pilha.recomendar(projeto(), [profissional('a')]);
        pilha.recomendar(projeto(), [profissional('a')]);

        expect(registro.entradas).toHaveLength(1);
        expect(lento.chamadas).toBe(1);
    });

    it('cache + auditoria + compressao funcionam juntos sobre o mesmo base', () => {
        const registro = new RegistradorAuditoriaMemoria();
        const cache = new CacheDecorator(new RecomendadorBase());
        const comp = new CompressaoDecorator(new AuditoriaDecorator(cache, registro));
        const profs = Array.from({ length: 20 }, (_, i) => profissional(`p${i}`));

        comp.recomendar(projeto(), profs);
        comp.recomendar(projeto(), profs);

        expect(registro.entradas).toHaveLength(2);
        expect(cache.estatisticas().acertos).toBe(1);
        expect(comp.ultimoPacote()!.tamanhoComprimido).toBeLessThan(
            comp.ultimoPacote()!.tamanhoOriginal
        );
    });
});