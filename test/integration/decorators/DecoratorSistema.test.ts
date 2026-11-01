import { SistemaRecomendacao } from '../../../src/observers/SistemaRecomendacao';
import { OrquestradorPadrao } from '../../../src/orchestration/OrquestradorPadrao';
import { RepositorioProfissionalMemoria } from '../../../src/repositories/RepositorioProfissionalMemoria';
import { RecomendadorBase } from '../../../src/strategies/RecomendadorBase';
import { RegistradorAuditoriaMemoria } from '../../../src/decorators/AuditoriaDecorator';
import { CompressaoDecorator } from '../../../src/decorators/CompressaoDecorator';
import { montarPilhaRecomendador } from '../../../src/decorators/montarPilhaRecomendador';
import { Projeto } from '../../../src/domain/Projeto';
import { Papel } from '../../../src/domain/Papel';

function novoProjeto(id: string): Projeto {
    return new Projeto(id, 'documentario', 90, 30000, new Date('2035-01-01'), [
        { papel: Papel.DIRETOR, peso: 1 },
        { papel: Papel.EDITOR, peso: 0.8 },
        { papel: Papel.SONOPLASTA, peso: 0.6 }
    ]);
}

function novoSistema(): SistemaRecomendacao {
    return new SistemaRecomendacao(
        new OrquestradorPadrao(new RepositorioProfissionalMemoria()),
        new RecomendadorBase()
    );
}

describe('Decorator integrado ao SistemaRecomendacao (que nao foi modificado)', () => {
    it('cache + auditoria + compressao: pilha definida em tempo de execucao', async () => {
        const sistema = novoSistema();
        const registro = new RegistradorAuditoriaMemoria();
        const pilha = montarPilhaRecomendador(
            new RecomendadorBase(),
            ['cache', 'auditoria', 'compressao'],
            { registrador: registro }
        );

        sistema.definirEstrategia(pilha.topo);

        const equipe1 = await sistema.executarRecomendacao(novoProjeto('proj-1'));
        const equipe2 = await sistema.executarRecomendacao(novoProjeto('proj-2'));

        expect(equipe1).toBeDefined();
        expect(equipe2).toBeDefined();

        expect(pilha.cache!.estatisticas()).toMatchObject({ acertos: 1, falhas: 1 });

        expect(registro.entradas.map((e) => e.projetoId)).toEqual(['proj-1', 'proj-2']);
        expect(registro.entradas.every((e) => e.sucesso)).toBe(true);

        const pacote = pilha.compressao!.ultimoPacote()!;
        const dados = CompressaoDecorator.descomprimir(pacote.dados);
        expect(dados.map((d) => d.papel).sort()).toEqual(
            [Papel.DIRETOR, Papel.EDITOR, Papel.SONOPLASTA].sort()
        );
    });

    it('a pilha nao altera o resultado: mesma equipe que o recomendador sem decoradores', async () => {
        const simples = novoSistema();
        const decorado = novoSistema();
        decorado.definirEstrategia(
            montarPilhaRecomendador(
                new RecomendadorBase(),
                ['cache', 'auditoria', 'compressao'],
                { registrador: new RegistradorAuditoriaMemoria() }
            ).topo
        );

        const e1 = await simples.executarRecomendacao(novoProjeto('x'));
        const e2 = await decorado.executarRecomendacao(novoProjeto('x'));

        const ids = (e: typeof e1) => e.contem().map((m) => `${m.papel}:${m.profissional.id}`);
        expect(ids(e2)).toEqual(ids(e1));
    });

    it('trocar a pilha em tempo de execucao muda o comportamento sem tocar no sistema', async () => {
        const sistema = novoSistema();

        const registroA = new RegistradorAuditoriaMemoria();
        sistema.definirEstrategia(
            montarPilhaRecomendador(new RecomendadorBase(), ['cache', 'auditoria'], {
                registrador: registroA
            }).topo
        );
        await sistema.executarRecomendacao(novoProjeto('a1'));
        await sistema.executarRecomendacao(novoProjeto('a2'));
        expect(registroA.entradas).toHaveLength(2);

        const registroB = new RegistradorAuditoriaMemoria();
        sistema.definirEstrategia(
            montarPilhaRecomendador(new RecomendadorBase(), ['auditoria', 'cache'], {
                registrador: registroB
            }).topo
        );
        await sistema.executarRecomendacao(novoProjeto('b1'));
        await sistema.executarRecomendacao(novoProjeto('b2'));
        expect(registroB.entradas).toHaveLength(1);
    });
});