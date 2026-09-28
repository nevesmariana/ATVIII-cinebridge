import { RepositorioProfissionalMemoria } from '../../../src/repositories/RepositorioProfissionalMemoria';

describe(
    'RepositorioProfissionalMemoria',
    () => {

        it(
            'buscarPorId encontra um profissional existente',
            async () => {

                const repositorio =
                    new RepositorioProfissionalMemoria();

                const encontrado =
                    await repositorio.buscarPorId(
                        'p1'
                    );

                expect(
                    encontrado
                ).toBeDefined();

                expect(
                    encontrado?.id
                ).toBe('p1');
            }
        );

        it(
            'buscarPorId devolve undefined para um id inexistente',
            async () => {

                const repositorio =
                    new RepositorioProfissionalMemoria();

                const resultado =
                    await repositorio.buscarPorId(
                        'id-que-nao-existe'
                    );

                expect(
                    resultado
                ).toBeUndefined();
            }
        );
    }
);