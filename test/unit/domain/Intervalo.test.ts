import { Intervalo } from '../../../src/domain/Intervalo';

describe(
    'Intervalo',
    () => {

        it(
            'lanca erro se a data de inicio for depois da data de fim',
            () => {

                expect(() =>
                    new Intervalo(
                        new Date('2026-12-31'),
                        new Date('2026-01-01')
                    )
                ).toThrow();
            }
        );

        it(
            'contem() verifica se uma data esta dentro do intervalo',
            () => {

                const intervalo =
                    new Intervalo(
                        new Date('2026-01-01'),
                        new Date('2026-12-31')
                    );

                expect(
                    intervalo.contem(
                        new Date('2026-06-15')
                    )
                ).toBe(true);

                expect(
                    intervalo.contem(
                        new Date('2027-01-01')
                    )
                ).toBe(false);
            }
        );

        it(
            'sobrepoe() verifica se dois intervalos se cruzam',
            () => {

                const a =
                    new Intervalo(
                        new Date('2026-01-01'),
                        new Date('2026-06-30')
                    );

                const b =
                    new Intervalo(
                        new Date('2026-06-01'),
                        new Date('2026-12-31')
                    );

                const c =
                    new Intervalo(
                        new Date('2027-01-01'),
                        new Date('2027-06-30')
                    );

                expect(
                    a.sobrepoe(b)
                ).toBe(true);

                expect(
                    a.sobrepoe(c)
                ).toBe(false);
            }
        );
    }
);