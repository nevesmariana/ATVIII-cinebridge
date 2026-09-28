import { buildApp } from '../../../src/http/build';

import { RepositorioProfissionalMemoria } from '../../../src/repositories/RepositorioProfissionalMemoria';

describe(
    'POST /recomendacoes (teste de integracao)',
    () => {

        it(
            'recebe um projeto via HTTP e devolve uma equipe recomendada',
            async () => {

                const app =
                    buildApp(
                        new RepositorioProfissionalMemoria()
                    );

                const resposta =
                    await app.inject({
                        method: 'POST',
                        url: '/recomendacoes',
                        payload: {
                            projeto: {
                                id: 'proj-teste',
                                genero: 'documentario',
                                duracao: 90,
                                orcamento: 30000,
                                prazo: '2035-01-01',
                                papeisExigidos: [
                                    {
                                        papel: 'DIRETOR',
                                        peso: 1
                                    },
                                    {
                                        papel: 'EDITOR',
                                        peso: 0.8
                                    }
                                ]
                            },
                            estrategia: 'similaridadeCosseno'
                        }
                    });

                expect(
                    resposta.statusCode
                ).toBe(200);

                const corpo =
                    JSON.parse(
                        resposta.payload
                    );

                expect(
                    corpo.projetoId
                ).toBe('proj-teste');

                expect(
                    corpo.membros
                ).toHaveLength(2);

                const diretor =
                    corpo.membros.find(
                        (m: any) =>
                            m.papel === 'DIRETOR'
                    );

                expect(
                    diretor.profissionalNome
                ).toBe('Ana Silva');
            }
        );

        it(
            'devolve erro 400 quando o campo projeto esta faltando',
            async () => {

                const app =
                    buildApp(
                        new RepositorioProfissionalMemoria()
                    );

                const resposta =
                    await app.inject({
                        method: 'POST',
                        url: '/recomendacoes',
                        payload: {
                            estrategia: 'similaridadeCosseno'
                        }
                    });

                expect(
                    resposta.statusCode
                ).toBe(400);
            }
        );
    }
);
