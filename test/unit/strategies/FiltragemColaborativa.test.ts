import { FiltragemColaborativa } from '../../../src/strategies/FiltragemColaborativa';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Avaliacao } from '../../../src/domain/Avaliacao';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Projeto } from '../../../src/domain/Projeto';
import { Papel } from '../../../src/domain/Papel';

function criarProfissional(
    id: string,
    nome: string
): Profissional {

    return new Profissional(
        id,
        nome,
        [
            new Competencia(
                'generico',
                5
            )
        ],
        new Intervalo(
            new Date('2026-01-01'),
            new Date('2026-12-31')
        ),
        1000
    );
}

describe(
    'FiltragemColaborativa',
    () => {

        it(
            'prioriza o profissional com a maior media de avaliacoes',
            () => {

                const bemAvaliado =
                    criarProfissional(
                        'p1',
                        'Bem Avaliado'
                    );

                bemAvaliado.recebe(
                    new Avaliacao(
                        5,
                        'Excelente',
                        new Date()
                    )
                );

                bemAvaliado.recebe(
                    new Avaliacao(
                        4,
                        'Muito bom',
                        new Date()
                    )
                );

                const malAvaliado =
                    criarProfissional(
                        'p2',
                        'Mal Avaliado'
                    );

                malAvaliado.recebe(
                    new Avaliacao(
                        2,
                        'Fraco',
                        new Date()
                    )
                );

                const projeto =
                    new Projeto(
                        'proj-1',
                        'doc',
                        60,
                        5000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.EDITOR,
                                peso: 1
                            }
                        ]
                    );

                const ranking =
                    new FiltragemColaborativa()
                        .recomendar(
                            projeto,
                            [
                                malAvaliado,
                                bemAvaliado
                            ]
                        )
                        .get(Papel.EDITOR);

                expect(
                    ranking?.[0].id
                ).toBe('p1');
            }
        );

        it(
            'ignora profissionais sem nenhuma avaliacao',
            () => {

                const semAvaliacao =
                    criarProfissional(
                        'p3',
                        'Sem Avaliacao'
                    );

                const projeto =
                    new Projeto(
                        'proj-2',
                        'doc',
                        60,
                        5000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.EDITOR,
                                peso: 1
                            }
                        ]
                    );

                const ranking =
                    new FiltragemColaborativa()
                        .recomendar(
                            projeto,
                            [semAvaliacao]
                        )
                        .get(Papel.EDITOR);

                expect(
                    ranking
                ).toEqual([]);
            }
        );
    }
);