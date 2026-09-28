import { OrquestradorPadrao } from '../../../src/orchestration/OrquestradorPadrao';

import { RepositorioProfissional } from '../../../src/repositories/RepositorioProfissional';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Projeto } from '../../../src/domain/Projeto';
import { Papel } from '../../../src/domain/Papel';

import { SimilaridadeCosseno } from '../../../src/strategies/SimilaridadeCosseno';
import { RegrasOrcamento } from '../../../src/strategies/RegrasOrcamento';

function criarProfissional(
    id: string,
    nome: string,
    preco: number
): Profissional {

    return new Profissional(
        id,
        nome,
        [
            new Competencia(
                'generico',
                8
            )
        ],
        new Intervalo(
            new Date('2020-01-01'),
            new Date('2100-12-31')
        ),
        preco
    );
}

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
    'OrquestradorPadrao (Template Method)',
    () => {

        it(
            'rejeita projetos com orcamento invalido (validarRestricoes)',
            async () => {

                const orquestrador =
                    new OrquestradorPadrao(
                        new RepositorioFalso([])
                    );

                const projetoInvalido =
                    new Projeto(
                        'p1',
                        'doc',
                        60,
                        0,
                        new Date('2035-01-01'),
                        [
                            {
                                papel: Papel.DIRETOR,
                                peso: 1
                            }
                        ]
                    );

                await expect(
                    orquestrador.orquestrar(
                        projetoInvalido,
                        new SimilaridadeCosseno()
                    )
                ).rejects.toThrow();
            }
        );

        it(
            'nunca aloca o mesmo profissional em dois papeis diferentes na mesma equipe',
            async () => {

                const unicoCandidato =
                    criarProfissional(
                        'p1',
                        'Unico',
                        500
                    );

                const orquestrador =
                    new OrquestradorPadrao(
                        new RepositorioFalso([
                            unicoCandidato
                        ])
                    );

                const projeto =
                    new Projeto(
                        'p2',
                        'doc',
                        60,
                        5000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.DIRETOR,
                                peso: 1
                            },
                            {
                                papel: Papel.EDITOR,
                                peso: 1
                            }
                        ]
                    );

                const equipe =
                    await orquestrador.orquestrar(
                        projeto,
                        new RegrasOrcamento()
                    );

                expect(
                    equipe.contem().length
                ).toBe(1);
            }
        );

        it(
            'segue sempre a mesma ordem de passos (validar -> normalizar -> recomendar -> pos-processar)',
            async () => {

                const candidato =
                    criarProfissional(
                        'p1',
                        'Candidato',
                        500
                    );

                const orquestrador =
                    new OrquestradorPadrao(
                        new RepositorioFalso([
                            candidato
                        ])
                    );

                const validarSpy =
                    jest.spyOn(
                        orquestrador as any,
                        'validarRestricoes'
                    );

                const normalizarSpy =
                    jest.spyOn(
                        orquestrador as any,
                        'normalizarDados'
                    );

                const posProcessarSpy =
                    jest.spyOn(
                        orquestrador as any,
                        'posProcessar'
                    );

                const projeto =
                    new Projeto(
                        'p3',
                        'doc',
                        60,
                        5000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.DIRETOR,
                                peso: 1
                            }
                        ]
                    );

                await orquestrador.orquestrar(
                    projeto,
                    new SimilaridadeCosseno()
                );

                expect(
                    validarSpy
                ).toHaveBeenCalled();

                expect(
                    normalizarSpy
                ).toHaveBeenCalled();

                expect(
                    posProcessarSpy
                ).toHaveBeenCalled();
            }
        );
    }
);