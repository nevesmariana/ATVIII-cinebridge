import { ValidadorConsistencia } from '../../../src/visitors/ValidadorConsistencia';
import { CalculadorCompatibilidade } from '../../../src/visitors/CalculadorCompatibilidade';
import { GeradorRelatorio } from '../../../src/visitors/GeradorRelatorio';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Projeto } from '../../../src/domain/Projeto';
import { Equipe } from '../../../src/domain/Equipe';
import { Papel } from '../../../src/domain/Papel';

function montarProjetoComEquipe(): Projeto {

    const profissional =
        new Profissional(
            'p1',
            'Ana Silva',
            [
                new Competencia(
                    'direcao',
                    8
                ),
                new Competencia(
                    'lideranca',
                    7
                )
            ],
            new Intervalo(
                new Date('2026-01-01'),
                new Date('2026-12-31')
            ),
            3000
        );

    const projeto =
        new Projeto(
            'proj-1',
            'documentario',
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

    const equipe =
        new Equipe(
            'equipe-1',
            new Date()
        );

    equipe.aloca(
        Papel.DIRETOR,
        profissional
    );

    projeto.define(equipe);

    return projeto;
}

describe(
    'Padrao Visitor: mesma estrutura, operacoes diferentes',
    () => {

        it(
            'ValidadorConsistencia devolve um boolean',
            () => {

                const projeto =
                    montarProjetoComEquipe();

                const resultado =
                    projeto.aceitar(
                        new ValidadorConsistencia()
                    );

                expect(
                    typeof resultado
                ).toBe('boolean');

                expect(
                    resultado
                ).toBe(true);
            }
        );

        it(
            'CalculadorCompatibilidade devolve um numero',
            () => {

                const projeto =
                    montarProjetoComEquipe();

                const resultado =
                    projeto.aceitar(
                        new CalculadorCompatibilidade()
                    );

                expect(
                    typeof resultado
                ).toBe('number');

                expect(
                    resultado
                ).toBeGreaterThan(0);
            }
        );

        it(
            'GeradorRelatorio devolve uma string com os dados do projeto',
            () => {

                const projeto =
                    montarProjetoComEquipe();

                const resultado =
                    projeto.aceitar(
                        new GeradorRelatorio()
                    );

                expect(
                    typeof resultado
                ).toBe('string');

                expect(
                    resultado
                ).toContain('proj-1');

                expect(
                    resultado
                ).toContain('Ana Silva');
            }
        );

        it(
            'um projeto SEM equipe formada e considerado inconsistente',
            () => {

                const projetoVazio =
                    new Projeto(
                        'proj-2',
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

                const resultado =
                    projetoVazio.aceitar(
                        new ValidadorConsistencia()
                    );

                expect(
                    resultado
                ).toBe(false);
            }
        );
    }
);
