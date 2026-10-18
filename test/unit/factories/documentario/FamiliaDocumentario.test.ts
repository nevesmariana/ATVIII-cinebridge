
import { FabricaDocumentario } from '../../../../src/factories/documentario/FabricaDocumentario';
import { ProjetoDocumentario } from '../../../../src/domain/ProjetoDocumentario';
import { RecomendadorDocumentario } from '../../../../src/factories/documentario/RecomendadorDocumentario';
import { ValidadorDocumentario } from '../../../../src/factories/documentario/ValidadorDocumentario';
import { NotificadorDocumentario } from '../../../../src/factories/documentario/NotificadorDocumentario';
import { Profissional } from '../../../../src/domain/Profissional';
import { Competencia } from '../../../../src/domain/Competencia';
import { Intervalo } from '../../../../src/domain/Intervalo';
import { Projeto } from '../../../../src/domain/Projeto';
import { Equipe } from '../../../../src/domain/Equipe';
import { Papel } from '../../../../src/domain/Papel';

function criarProfissional(
    id: string,
    nome: string,
    competencias: [string, number][]
): Profissional {
    return new Profissional(
        id,
        nome,
        competencias.map(
            ([n, nivel]) => new Competencia(n, nivel)
        ),
        new Intervalo(
            new Date('2020-01-01'),
            new Date('2100-12-31')
        ),
        1000
    );
}

describe('Familia Documentario (Factory Method + Abstract Factory)', () => {
    const fabrica = new FabricaDocumentario();

    it('criarProjeto devolve um ProjetoDocumentario com os campos específicos', () => {
        const projeto = fabrica.criarProjeto({
            id: 'doc-1',
            genero: 'documentario',
            duracao: 60,
            orcamento: 10000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ],
            tema: 'cultura nordestina',
            entrevistados: ['Maria', 'Joao']
        }) as ProjetoDocumentario;

        expect(projeto).toBeInstanceOf(ProjetoDocumentario);
        expect(projeto.tema).toBe('cultura nordestina');
        expect(projeto.entrevistados).toEqual(['Maria', 'Joao']);
    });

    it('criarValidador, criarRecomendador e criarNotificador devolvem a família correta', () => {
        expect(fabrica.criarValidador())
            .toBeInstanceOf(ValidadorDocumentario);

        expect(fabrica.criarRecomendador())
            .toBeInstanceOf(RecomendadorDocumentario);

        expect(fabrica.criarNotificador())
            .toBeInstanceOf(NotificadorDocumentario);
    });

    it('RecomendadorDocumentario prioriza quem tem competência de entrevista no papel de Diretor', () => {
        const comEntrevista = criarProfissional(
            'p1',
            'Com Entrevista',
            [
                ['direcao', 7],
                ['entrevista', 9]
            ]
        );

        const semEntrevista = criarProfissional(
            'p2',
            'Sem Entrevista',
            [
                ['direcao', 7]
            ]
        );

        const projeto = fabrica.criarProjeto({
            id: 'doc-2',
            genero: 'documentario',
            duracao: 60,
            orcamento: 10000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ],
            tema: 'teste',
            entrevistados: ['A']
        });

        const ranking = fabrica
            .criarRecomendador()
            .recomendar(
                projeto,
                [semEntrevista, comEntrevista]
            )
            .get(Papel.DIRETOR);

        expect(ranking?.[0].id).toBe('p1');
    });

    it('ValidadorDocumentario reprova um documentário sem nenhum entrevistado definido', () => {
        const projetoSemEntrevistados = fabrica.criarProjeto({
            id: 'doc-3',
            genero: 'documentario',
            duracao: 60,
            orcamento: 10000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ],
            tema: 'teste',
            entrevistados: []
        });

        const diretor = criarProfissional(
            'p1',
            'Diretor',
            [
                ['direcao', 8]
            ]
        );

        const equipe = new Equipe(
            'eq-1',
            new Date()
        );

        equipe.aloca(
            Papel.DIRETOR,
            diretor
        );

        projetoSemEntrevistados.define(equipe);

        expect(
            projetoSemEntrevistados.aceitar(
                fabrica.criarValidador()
            )
        ).toBe(false);
    });


    it(
        'ValidadorDocumentario reprova quando a consistencia basica falha (sem equipe definida)',
        () => {
            const projetoSemEquipe = fabrica.criarProjeto({
                id: 'doc-4',
                genero: 'documentario',
                duracao: 60,
                orcamento: 10000,
                prazo: new Date('2035-01-01'),
                papeisExigidos: [
                    {
                        papel: Papel.DIRETOR,
                        peso: 1
                    }
                ],
                tema: 'teste',
                entrevistados: ['A']
            });

            expect(
                projetoSemEquipe.aceitar(
                    fabrica.criarValidador()
                )
            ).toBe(false);
        }
    );

    it(
        'ValidadorDocumentario aceita um Projeto generico que passe nas regras basicas',
        () => {
            const projetoGenerico = new Projeto(
                'generico-1',
                'ficcao',
                60,
                10000,
                new Date('2035-01-01'),
                [
                    {
                        papel: Papel.DIRETOR,
                        peso: 1
                    }
                ]
            );

            const diretor = criarProfissional(
                'p1',
                'Diretor',
                [['direcao', 8]]
            );

            const equipe = new Equipe('eq-x', new Date());

            equipe.aloca(Papel.DIRETOR, diretor);
            projetoGenerico.define(equipe);

            expect(
                projetoGenerico.aceitar(
                    fabrica.criarValidador()
                )
            ).toBe(true);
        }
    );

    it(
        'ValidadorDocumentario.visitarProfissional delega para o validador base',
        () => {
            const valido = criarProfissional(
                'p1',
                'Valido',
                [['direcao', 8]]
            );

            const invalido = new Profissional(
                'p2',
                'Invalido',
                [],
                new Intervalo(
                    new Date('2020-01-01'),
                    new Date('2100-12-31')
                ),
                0
            );

            const validador = fabrica.criarValidador();

            expect(valido.aceitar(validador)).toBe(true);
            expect(invalido.aceitar(validador)).toBe(false);
        }
    );

    it(
        'RecomendadorDocumentario nao quebra quando o papel de Diretor nao e exigido',
        () => {
            const projetoSemDiretor = fabrica.criarProjeto({
                id: 'doc-5',
                genero: 'documentario',
                duracao: 60,
                orcamento: 10000,
                prazo: new Date('2035-01-01'),
                papeisExigidos: [
                    {
                        papel: Papel.EDITOR,
                        peso: 1
                    }
                ],
                tema: 'teste',
                entrevistados: ['A']
            });

            const editor = criarProfissional(
                'p1',
                'Editor',
                [['edicao', 8]]
            );

            const resultado = fabrica
                .criarRecomendador()
                .recomendar(projetoSemDiretor, [editor]);

            expect(
                resultado.get(Papel.DIRETOR)
            ).toBeUndefined();
        }
    );
});
