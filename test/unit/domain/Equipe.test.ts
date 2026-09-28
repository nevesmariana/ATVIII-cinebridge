import { Equipe } from '../../../src/domain/Equipe';

import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Papel } from '../../../src/domain/Papel';

function criarProfissional(
    id: string
): Profissional {

    return new Profissional(
        id,
        'Fulano',
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
    'Equipe',
    () => {

        it(
            'substituir troca o profissional de um papel ja alocado',
            () => {

                const equipe =
                    new Equipe(
                        'eq-1',
                        new Date()
                    );

                const original =
                    criarProfissional('p1');

                const novo =
                    criarProfissional('p2');

                equipe.aloca(
                    Papel.DIRETOR,
                    original
                );

                equipe.substituir(
                    Papel.DIRETOR,
                    novo
                );

                expect(
                    equipe.contem()[0].profissional.id
                ).toBe('p2');
            }
        );

        it(
            'substituir lanca erro se o papel nao existe na equipe',
            () => {

                const equipe =
                    new Equipe(
                        'eq-2',
                        new Date()
                    );

                const novo =
                    criarProfissional('p2');

                expect(() =>
                    equipe.substituir(
                        Papel.EDITOR,
                        novo
                    )
                ).toThrow();
            }
        );

        it(
            'papeisPreenchidos lista todos os papeis ja alocados',
            () => {

                const equipe =
                    new Equipe(
                        'eq-3',
                        new Date()
                    );

                equipe.aloca(
                    Papel.DIRETOR,
                    criarProfissional('p1')
                );

                equipe.aloca(
                    Papel.EDITOR,
                    criarProfissional('p2')
                );

                expect(
                    equipe.papeisPreenchidos()
                ).toEqual([
                    Papel.DIRETOR,
                    Papel.EDITOR
                ]);
            }
        );
    }
);