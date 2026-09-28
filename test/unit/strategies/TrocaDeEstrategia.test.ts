import { SimilaridadeCosseno } from '../../../src/strategies/SimilaridadeCosseno';
import { RegrasOrcamento } from '../../../src/strategies/RegrasOrcamento';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Projeto } from '../../../src/domain/Projeto';
import { Papel } from '../../../src/domain/Papel';

describe(
    'Troca de estrategia (padrao Strategy)',
    () => {

        it(
            'produz resultados diferentes para o mesmo projeto ao trocar de estrategia',
            () => {

                const competenteECaro =
                    new Profissional(
                        'p1',
                        'Competente e Caro',
                        [
                            new Competencia(
                                'direcao',
                                9
                            ),
                            new Competencia(
                                'lideranca',
                                9
                            ),
                            new Competencia(
                                'narrativa',
                                9
                            )
                        ],
                        new Intervalo(
                            new Date('2026-01-01'),
                            new Date('2026-12-31')
                        ),
                        9000
                    );

                const fracoEBarato = new Profissional('p2', 'Fraco e Barato', [
                    new Competencia('direcao', 1)],
                    new Intervalo(new Date('2026-01-01'),
                        new Date('2026-12-31')), 500);

                const projeto =
                    new Projeto(
                        'proj-1',
                        'documentario',
                        60,
                        1000,
                        new Date('2027-01-01'),
                        [
                            {
                                papel: Papel.DIRETOR,
                                peso: 1
                            }
                        ]
                    );

                const porCompetencia =
                    new SimilaridadeCosseno()
                        .recomendar(
                            projeto,
                            [
                                competenteECaro,
                                fracoEBarato
                            ]
                        )
                        .get(Papel.DIRETOR);

                const porOrcamento =
                    new RegrasOrcamento()
                        .recomendar(
                            projeto,
                            [
                                competenteECaro,
                                fracoEBarato
                            ]
                        )
                        .get(Papel.DIRETOR);

                expect(
                    porCompetencia?.[0].id
                ).toBe('p1');

                expect(
                    porOrcamento?.[0].id
                ).toBe('p2');

                expect(
                    porCompetencia?.[0].id
                ).not.toBe(
                    porOrcamento?.[0].id
                );
            }
        );
    }
);