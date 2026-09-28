import { SimilaridadeCosseno } from '../../../src/strategies/SimilaridadeCosseno';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Projeto } from '../../../src/domain/Projeto';
import { Papel } from '../../../src/domain/Papel';

function criarProfissional(
    id: string,
    nome: string,
    competencias: [string, number][],
    preco = 1000
): Profissional {

    return new Profissional(
        id,
        nome,
        competencias.map(
            ([n, nivel]) =>
                new Competencia(n, nivel)
        ),
        new Intervalo(
            new Date('2026-01-01'),
            new Date('2026-12-31')
        ),
        preco
    );
}

describe(
    'SimilaridadeCosseno',
    () => {

        it(
            'recomenda primeiro o profissional com maior similaridade de competencias',
            () => {

                const bom =
                    criarProfissional(
                        'p1',
                        'Diretor Bom',
                        [
                            ['direcao', 9],
                            ['lideranca', 8],
                            ['narrativa', 7]
                        ]
                    );

                const fraco =
                    criarProfissional(
                        'p2',
                        'Diretor Fraco',
                        [
                            ['direcao', 2],
                            ['lideranca', 1],
                            ['narrativa', 1]
                        ]
                    );

                const projeto =
                    new Projeto(
                        'proj-1',
                        'ficcao',
                        60,
                        10000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.DIRETOR,
                                peso: 1
                            }
                        ]
                    );

                const ranking =
                    new SimilaridadeCosseno()
                        .recomendar(
                            projeto,
                            [fraco, bom]
                        )
                        .get(Papel.DIRETOR);

                expect(
                    ranking?.[0].id
                ).toBe('p1');
            }
        );

        it(
            'nao recomenda ninguem para um papel sem nenhum candidato com a competencia',
            () => {

                const semSkill =
                    criarProfissional(
                        'p3',
                        'Sem Skill',
                        [
                            ['culinaria', 10]
                        ]
                    );

                const projeto =
                    new Projeto(
                        'proj-2',
                        'ficcao',
                        60,
                        10000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.EDITOR,
                                peso: 1
                            }
                        ]
                    );

                const ranking =
                    new SimilaridadeCosseno()
                        .recomendar(
                            projeto,
                            [semSkill]
                        )
                        .get(Papel.EDITOR);
                expect(ranking).toEqual([]);
            }
        );
    }
);