
import { buildApp } from '../../../src/http/build';
import { RepositorioProfissionalMemoria } from '../../../src/repositories/RepositorioProfissionalMemoria';

describe(
    'POST /recomendacoes/:tipo (integracao - Abstract Factory)',
    () => {
        it(
            'cria uma equipe para um projeto de documentario',
            async () => {
                const app = buildApp(
                    new RepositorioProfissionalMemoria()
                );

                const resposta = await app.inject({
                    method: 'POST',
                    url: '/recomendacoes/documentario',
                    payload: {
                        dados: {
                            id: 'doc-teste',
                            genero: 'documentario',
                            duracao: 60,
                            orcamento: 10000,
                            prazo: '2035-01-01',
                            papeisExigidos: [
                                {
                                    papel: 'DIRETOR',
                                    peso: 1
                                }
                            ],
                            tema: 'teste',
                            entrevistados: ['A']
                        }
                    }
                });

                expect(resposta.statusCode).toBe(200);

                const corpo = JSON.parse(resposta.payload);

                expect(corpo.tipoProjeto).toBe('documentario');
                expect(corpo.membros).toHaveLength(1);
            }
        );

        it(
            'cria uma equipe para um projeto de animacao, usando a MESMA rota generica',
            async () => {
                const app = buildApp(
                    new RepositorioProfissionalMemoria()
                );

                const resposta = await app.inject({
                    method: 'POST',
                    url: '/recomendacoes/animacao',
                    payload: {
                        dados: {
                            id: 'anim-teste',
                            genero: 'animacao',
                            duracao: 30,
                            orcamento: 15000,
                            prazo: '2035-01-01',
                            papeisExigidos: [
                                {
                                    papel: 'DIRETOR',
                                    peso: 1
                                }
                            ],
                            motorGrafico: 'Blender',
                            resolucaoEntrega: '4K'
                        }
                    }
                });

                expect(resposta.statusCode).toBe(200);

                expect(
                    JSON.parse(resposta.payload).tipoProjeto
                ).toBe('animacao');
            }
        );

        it(
            'devolve 422 para um tipo de projeto nao registrado',
            async () => {
                const app = buildApp(
                    new RepositorioProfissionalMemoria()
                );

                const resposta = await app.inject({
                    method: 'POST',
                    url: '/recomendacoes/videoclipe',
                    payload: {
                        dados: {
                            id: 'x'
                        }
                    }
                });

                expect(resposta.statusCode).toBe(422);
            }
        );

        it(
            'devolve 400 quando o campo dados esta faltando',
            async () => {
                const app = buildApp(
                    new RepositorioProfissionalMemoria()
                );

                const resposta = await app.inject({
                    method: 'POST',
                    url: '/recomendacoes/documentario',
                    payload: {}
                });

                expect(resposta.statusCode).toBe(400);
            }
        );
    }
);
