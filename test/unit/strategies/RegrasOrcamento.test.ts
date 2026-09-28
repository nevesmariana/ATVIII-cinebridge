import { RegrasOrcamento } from '../../../src/strategies/RegrasOrcamento';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Projeto } from '../../../src/domain/Projeto';
import { Papel } from '../../../src/domain/Papel';

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
                5
            )
        ],
        new Intervalo(
            new Date('2026-01-01'),
            new Date('2026-12-31')
        ),
        preco
    );
}

describe(
    'RegrasOrcamento',
    () => {

        it(
            'prioriza o profissional mais barato dentro do limite por papel',
            () => {

                const caro =
                    criarProfissional(
                        'p1',
                        'Caro',
                        9000
                    );

                const barato =
                    criarProfissional(
                        'p2',
                        'Barato',
                        1000
                    );

                const projeto =
                    new Projeto(
                        'proj-1',
                        'documentario',
                        60,
                        2000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.EDITOR,
                                peso: 1
                            }
                        ]
                    );

                const ranking =
                    new RegrasOrcamento()
                        .recomendar(
                            projeto,
                            [caro, barato]
                        )
                        .get(Papel.EDITOR);

                expect(
                    ranking?.[0].id
                ).toBe('p2');

                expect(
                    ranking?.find(
                        (p) => p.id === 'p1'
                    )
                ).toBeUndefined();

            }
        );
    }
);