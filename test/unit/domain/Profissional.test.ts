import { Profissional } from '../../../src/domain/Profissional';

import { Competencia } from '../../../src/domain/Competencia';
import { Avaliacao } from '../../../src/domain/Avaliacao';
import { Intervalo } from '../../../src/domain/Intervalo';

describe(
    'Profissional',
    () => {

        it(
            'possui() encontra uma competencia pelo nome',
            () => {

                const profissional =
                    new Profissional(
                        'p1',
                        'Fulano',
                        [
                            new Competencia(
                                'edicao',
                                8
                            )
                        ],
                        new Intervalo(
                            new Date('2026-01-01'),
                            new Date('2026-12-31')
                        ),
                        1000
                    );

                expect(
                    profissional.possui('edicao')?.nivel
                ).toBe(8);

                expect(
                    profissional.possui('inexistente')
                ).toBeUndefined();
            }
        );

        it(
            'mediaAvaliacoes calcula a media corretamente',
            () => {

                const profissional =
                    new Profissional(
                        'p2',
                        'Fulana',
                        [],
                        new Intervalo(
                            new Date('2026-01-01'),
                            new Date('2026-12-31')
                        ),
                        1000
                    );

                expect(
                    profissional.mediaAvaliacoes()
                ).toBe(0);

                // sem avaliacoes
                profissional.recebe(
                    new Avaliacao(
                        4,
                        'bom',
                        new Date()
                    )
                );

                profissional.recebe(
                    new Avaliacao(
                        2,
                        'ok',
                        new Date()
                    )
                );

                expect(
                    profissional.mediaAvaliacoes()
                ).toBe(3);
            }
        );
    }
);