
import { FabricaPublicitario } from '../../../../src/factories/publicitario/FabricaPublicitario';
import { ProjetoPublicitario } from '../../../../src/domain/ProjetoPublicitario';
import { RecomendadorPublicitario } from '../../../../src/factories/publicitario/RecomendadorPublicitario';
import { ValidadorPublicitario } from '../../../../src/factories/publicitario/ValidadorPublicitario';
import { NotificadorPublicitario } from '../../../../src/factories/publicitario/NotificadorPublicitario';
import { Profissional } from '../../../../src/domain/Profissional';
import { Competencia } from '../../../../src/domain/Competencia';
import { Intervalo } from '../../../../src/domain/Intervalo';
import { Equipe } from '../../../../src/domain/Equipe';
import { Papel } from '../../../../src/domain/Papel';
import { Projeto } from '../../../../src/domain/Projeto';
import { EventoRecomendacao } from '../../../../src/domain/EventoRecomendacao';

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

describe('Familia Publicitario (Factory Method + Abstract Factory)', () => {
    const fabrica = new FabricaPublicitario();

    it('criarProjeto devolve um ProjetoPublicitario com os campos específicos', () => {
        const projeto = fabrica.criarProjeto({
            id: 'ads-1',
            genero: 'publicitario',
            duracao: 1,
            orcamento: 8000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.EDITOR,
                    peso: 1
                }
            ],
            cliente: 'Marca X',
            plataformasDistribuicao: ['instagram']
        }) as ProjetoPublicitario;

        expect(projeto).toBeInstanceOf(ProjetoPublicitario);
        expect(projeto.cliente).toBe('Marca X');
    });

    it('criarValidador, criarRecomendador e criarNotificador devolvem a família correta', () => {
        expect(fabrica.criarValidador())
            .toBeInstanceOf(ValidadorPublicitario);

        expect(fabrica.criarRecomendador())
            .toBeInstanceOf(RecomendadorPublicitario);

        expect(fabrica.criarNotificador())
            .toBeInstanceOf(NotificadorPublicitario);
    });

    it('RecomendadorPublicitario prioriza quem tem competência de motion-graphics no papel de Editor', () => {
        const comMotion = criarProfissional(
            'p1',
            'Com Motion',
            [
                ['edicao', 7],
                ['motion-graphics', 9]
            ]
        );

        const semMotion = criarProfissional(
            'p2',
            'Sem Motion',
            [
                ['edicao', 7]
            ]
        );

        const projeto = fabrica.criarProjeto({
            id: 'ads-2',
            genero: 'publicitario',
            duracao: 1,
            orcamento: 8000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.EDITOR,
                    peso: 1
                }
            ],
            cliente: 'Marca X',
            plataformasDistribuicao: ['instagram']
        });

        const ranking = fabrica
            .criarRecomendador()
            .recomendar(
                projeto,
                [semMotion, comMotion]
            )
            .get(Papel.EDITOR);

        expect(ranking?.[0].id).toBe('p1');
    });

    it('ValidadorPublicitario reprova um projeto sem cliente ou sem plataforma definida', () => {
        const projetoInvalido = fabrica.criarProjeto({
            id: 'ads-3',
            genero: 'publicitario',
            duracao: 1,
            orcamento: 8000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.EDITOR,
                    peso: 1
                }
            ],
            cliente: '',
            plataformasDistribuicao: []
        });

        const editor = criarProfissional(
            'p1',
            'Editor',
            [
                ['edicao', 8]
            ]
        );

        const equipe = new Equipe(
            'eq-1',
            new Date()
        );

        equipe.aloca(
            Papel.EDITOR,
            editor
        );

        projetoInvalido.define(equipe);

        expect(
            projetoInvalido.aceitar(
                fabrica.criarValidador()
            )
        ).toBe(false);
    });


    it(
        'ValidadorPublicitario reprova quando a consistencia basica falha (sem equipe definida)',
        () => {
            const projetoSemEquipe = fabrica.criarProjeto({
                id: 'ads-4',
                genero: 'publicitario',
                duracao: 1,
                orcamento: 8000,
                prazo: new Date('2035-01-01'),
                papeisExigidos: [
                    {
                        papel: Papel.EDITOR,
                        peso: 1
                    }
                ],
                cliente: 'Marca X',
                plataformasDistribuicao: ['instagram']
            });

            expect(
                projetoSemEquipe.aceitar(
                    fabrica.criarValidador()
                )
            ).toBe(false);
        }
    );

    it(
        'ValidadorPublicitario aceita um Projeto generico que passe nas regras basicas',
        () => {
            const projetoGenerico = new Projeto(
                'generico-3',
                'ficcao',
                1,
                8000,
                new Date('2035-01-01'),
                [
                    {
                        papel: Papel.EDITOR,
                        peso: 1
                    }
                ]
            );

            const editor = criarProfissional(
                'p1',
                'Editor',
                [['edicao', 8]]
            );

            const equipe = new Equipe('eq-z', new Date());

            equipe.aloca(Papel.EDITOR, editor);
            projetoGenerico.define(equipe);

            expect(
                projetoGenerico.aceitar(
                    fabrica.criarValidador()
                )
            ).toBe(true);
        }
    );

    it(
        'ValidadorPublicitario.visitarProfissional delega para o validador base',
        () => {
            const valido = criarProfissional(
                'p1',
                'Valido',
                [['edicao', 8]]
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
        'RecomendadorPublicitario nao quebra quando o papel de Editor nao e exigido',
        () => {
            const projetoSemEditor = fabrica.criarProjeto({
                id: 'ads-5',
                genero: 'publicitario',
                duracao: 1,
                orcamento: 8000,
                prazo: new Date('2035-01-01'),
                papeisExigidos: [
                    {
                        papel: Papel.DIRETOR,
                        peso: 1
                    }
                ],
                cliente: 'Marca X',
                plataformasDistribuicao: ['instagram']
            });

            const diretor = criarProfissional(
                'p1',
                'Diretor',
                [['direcao', 8]]
            );

            const resultado = fabrica
                .criarRecomendador()
                .recomendar(projetoSemEditor, [diretor]);

            expect(
                resultado.get(Papel.EDITOR)
            ).toBeUndefined();
        }
    );

    it(
        'NotificadorPublicitario registra o evento sem lancar erro',
        () => {
            const evento = new EventoRecomendacao(
                'RECOMENDACAO_GERADA',
                new Map(),
                'teste'
            );

            expect(
                () => fabrica.criarNotificador().atualizar(evento)
            ).not.toThrow();
        }
    );
});
