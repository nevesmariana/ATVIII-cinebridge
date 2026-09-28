import { SistemaRecomendacao } from '../../../src/observers/SistemaRecomendacao';

import { Observador } from '../../../src/observers/Observador';
import { EventoRecomendacao } from '../../../src/domain/EventoRecomendacao';

import { OrquestradorPadrao } from '../../../src/orchestration/OrquestradorPadrao';

import { RepositorioProfissional } from '../../../src/repositories/RepositorioProfissional';

import { SimilaridadeCosseno } from '../../../src/strategies/SimilaridadeCosseno';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Projeto } from '../../../src/domain/Projeto';
import { Papel } from '../../../src/domain/Papel';

class RepositorioFalso
    implements RepositorioProfissional {

    constructor(
        private readonly profissionais: Profissional[]
    ) { }

    async listarTodos() {
        return this.profissionais;
    }

    async buscarPorId(
        id: string
    ) {
        return this.profissionais.find(
            (p) => p.id === id
        );
    }
}

describe(
    'SistemaRecomendacao (Observer)',
    () => {

        it(
            'notifica TODOS os observadores cadastrados quando uma recomendacao acontece',
            async () => {

                const candidato =
                    new Profissional(
                        'p1',
                        'Candidato',
                        [
                            new Competencia(
                                'direcao',
                                8
                            )
                        ],
                        new Intervalo(
                            new Date('2026-01-01'),
                            new Date('2026-12-31')
                        ),
                        1000
                    );

                const orquestrador =
                    new OrquestradorPadrao(
                        new RepositorioFalso([
                            candidato
                        ])
                    );

                const sistema =
                    new SistemaRecomendacao(
                        orquestrador,
                        new SimilaridadeCosseno()
                    );

                const observadorA: Observador = {
                    atualizar: jest.fn()
                };

                const observadorB: Observador = {
                    atualizar: jest.fn()
                };

                sistema.adicionarObservador(
                    observadorA
                );

                sistema.adicionarObservador(
                    observadorB
                );

                const projeto =
                    new Projeto(
                        'proj-1',
                        'doc',
                        60,
                        5000,
                        new Date(' 2035-01-01'),
                        [
                            {
                                papel: Papel.DIRETOR,
                                peso: 1
                            }
                        ]
                    );

                await sistema.executarRecomendacao(
                    projeto
                );

                expect(
                    observadorA.atualizar
                ).toHaveBeenCalledTimes(1);

                expect(
                    observadorB.atualizar
                ).toHaveBeenCalledTimes(1);

                const eventoRecebido =
                    (
                        observadorA.atualizar as jest.Mock
                    ).mock.calls[0][0] as EventoRecomendacao;

                expect(
                    eventoRecebido.tipo
                ).toBe(
                    'RECOMENDACAO_GERADA'
                );
            }
        );

        it(
            'cada observador reage de forma independente, sem afetar os outros',
            async () => {

                const observadorQueFalha: Observador = {
                    atualizar: jest.fn(() => {
                        throw new Error(
                            'falhou'
                        );
                    })
                };

                const observadorNormal: Observador = {
                    atualizar: jest.fn()
                };

                const sistema =
                    new SistemaRecomendacao(
                        new OrquestradorPadrao(
                            new RepositorioFalso([])
                        ),
                        new SimilaridadeCosseno()
                    );

                sistema.adicionarObservador(
                    observadorNormal
                );

                const evento =
                    new EventoRecomendacao(
                        'RECOMENDACAO_GERADA',
                        new Map(),
                        'teste'
                    );

                expect(() =>
                    sistema.notificarObservadores(
                        evento
                    )
                ).not.toThrow();

                expect(
                    observadorNormal.atualizar
                ).toHaveBeenCalledWith(
                    evento
                );
            }
        );
    }
);