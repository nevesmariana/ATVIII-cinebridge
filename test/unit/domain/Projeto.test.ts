import { Projeto } from '../../../src/domain/Projeto';
import { Equipe } from '../../../src/domain/Equipe';
import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
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
    'Projeto',
    () => {

        it(
            'aceitarRecomendacao aloca e confirma um membro na equipe',
            () => {

                const projeto =
                    new Projeto(
                        'p1',
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

                projeto.define(
                    new Equipe(
                        'eq-1',
                        new Date()
                    )
                );

                const profissional =
                    criarProfissional(
                        'prof-1',
                        'Fulano'
                    );

                projeto.aceitarRecomendacao(
                    Papel.DIRETOR,
                    profissional
                );

                const membro =
                    projeto.getEquipe()
                        ?.contem()[0];

                expect(
                    membro?.profissional.id
                ).toBe('prof-1');

                expect(
                    membro?.confirmado
                ).toBe(true);
            }
        );

        it(
            'aceitarRecomendacao lanca erro se a equipe ainda nao foi definida',
            () => {

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
                            }
                        ]
                    );

                const profissional =
                    criarProfissional(
                        'prof-1',
                        'Fulano'
                    );

                expect(() =>
                    projeto.aceitarRecomendacao(
                        Papel.DIRETOR,
                        profissional
                    )
                ).toThrow();
            }
        );

        it(
            'substituirMembro troca o profissional alocado em um papel',
            () => {

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

                projeto.define(
                    new Equipe(
                        'eq-2',
                        new Date()
                    )
                );

                const original =
                    criarProfissional(
                        'prof-1',
                        'Original'
                    );

                const substituto =
                    criarProfissional(
                        'prof-2',
                        'Substituto'
                    );

                projeto.aceitarRecomendacao(
                    Papel.DIRETOR,
                    original
                );

                projeto.substituirMembro(
                    Papel.DIRETOR,
                    substituto
                );

                const membro =
                    projeto.getEquipe()
                        ?.contem()[0];

                expect(
                    membro?.profissional.id
                ).toBe('prof-2');
            }
        );

        it(
            'substituirMembro lanca erro se a equipe ainda nao foi definida',
            () => {

                const projeto =
                    new Projeto(
                        'p4',
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

                const substituto =
                    criarProfissional(
                        'prof-2',
                        'Substituto'
                    );

                expect(() =>
                    projeto.substituirMembro(
                        Papel.DIRETOR,
                        substituto
                    )
                ).toThrow();
            }
        );

        it(
            'solicitarReavaliacao marca e consumirSolicitacaoReavaliacao reseta o estado',
            () => {

                const projeto =
                    new Projeto(
                        'p5',
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

                expect(
                    projeto.consumirSolicitacaoReavaliacao()
                ).toBe(false);

                projeto.solicitarReavaliacao();

                expect(
                    projeto.consumirSolicitacaoReavaliacao()
                ).toBe(true);

                expect(
                    projeto.consumirSolicitacaoReavaliacao()
                ).toBe(false);
            }
        );
    }
);