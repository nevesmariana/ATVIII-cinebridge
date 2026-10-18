
import { FabricaAnimacao } from '../../../../src/factories/animacao/FabricaAnimacao';
import { ProjetoAnimacao } from '../../../../src/domain/ProjetoAnimacao';
import { RecomendadorAnimacao } from '../../../../src/factories/animacao/RecomendadorAnimacao';
import { ValidadorAnimacao } from '../../../../src/factories/animacao/ValidadorAnimacao';
import { NotificadorAnimacao } from '../../../../src/factories/animacao/NotificadorAnimacao';
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

describe('Familia Animacao (Factory Method + Abstract Factory)', () => {
    const fabrica = new FabricaAnimacao();

    it('criarProjeto devolve um ProjetoAnimacao com os campos específicos', () => {
        const projeto = fabrica.criarProjeto({
            id: 'anim-1',
            genero: 'animacao',
            duracao: 30,
            orcamento: 15000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.EFEITOS_VISUAIS,
                    peso: 1
                }
            ],
            motorGrafico: 'Blender',
            resolucaoEntrega: '4K'
        }) as ProjetoAnimacao;

        expect(projeto).toBeInstanceOf(ProjetoAnimacao);
        expect(projeto.motorGrafico).toBe('Blender');
    });

    it('criarValidador, criarRecomendador e criarNotificador devolvem a família correta', () => {
        expect(fabrica.criarValidador())
            .toBeInstanceOf(ValidadorAnimacao);

        expect(fabrica.criarRecomendador())
            .toBeInstanceOf(RecomendadorAnimacao);

        expect(fabrica.criarNotificador())
            .toBeInstanceOf(NotificadorAnimacao);
    });

    it('RecomendadorAnimacao prioriza quem tem competência de modelagem3d em Efeitos Visuais', () => {

        const comModelagem = criarProfissional(
            'p1',
            'Com Modelagem',
            [['efeitos-visuais', 7], ['modelagem3d', 9]]
        );

        const semModelagem = criarProfissional(
            'p2',
            'Sem Modelagem',
            [['efeitos-visuais', 7]]
        );


        const projeto = fabrica.criarProjeto({
            id: 'anim-2',
            genero: 'animacao',
            duracao: 30,
            orcamento: 15000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.EFEITOS_VISUAIS,
                    peso: 1
                }
            ],
            motorGrafico: 'Blender',
            resolucaoEntrega: '4K'
        });

        const ranking = fabrica
            .criarRecomendador()
            .recomendar(
                projeto,
                [semModelagem, comModelagem]
            )
            .get(Papel.EFEITOS_VISUAIS);

        expect(ranking?.[0].id).toBe('p1');
    });

    it('ValidadorAnimacao reprova um projeto sem motor gráfico definido', () => {
        const projetoSemMotor = fabrica.criarProjeto({
            id: 'anim-3',
            genero: 'animacao',
            duracao: 30,
            orcamento: 15000,
            prazo: new Date('2035-01-01'),
            papeisExigidos: [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ],
            motorGrafico: '',
            resolucaoEntrega: '4K'
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

        projetoSemMotor.define(equipe);

        expect(
            projetoSemMotor.aceitar(
                fabrica.criarValidador()
            )
        ).toBe(false);
    });


    it(
        'ValidadorAnimacao reprova quando a consistencia basica falha (sem equipe definida)',
        () => {
            const projetoSemEquipe = fabrica.criarProjeto({
                id: 'anim-4',
                genero: 'animacao',
                duracao: 30,
                orcamento: 15000,
                prazo: new Date('2035-01-01'),
                papeisExigidos: [
                    {
                        papel: Papel.DIRETOR,
                        peso: 1
                    }
                ],
                motorGrafico: 'Blender',
                resolucaoEntrega: '4K'
            });

            expect(
                projetoSemEquipe.aceitar(
                    fabrica.criarValidador()
                )
            ).toBe(false);
        }
    );

    it(
        'ValidadorAnimacao aceita um Projeto generico que passe nas regras basicas',
        () => {
            const projetoGenerico = new Projeto(
                'generico-2',
                'ficcao',
                30,
                15000,
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

            const equipe = new Equipe('eq-y', new Date());

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
        'ValidadorAnimacao.visitarProfissional delega para o validador base',
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
        'RecomendadorAnimacao nao quebra quando o papel de Efeitos Visuais nao e exigido',
        () => {
            const projetoSemEV = fabrica.criarProjeto({
                id: 'anim-5',
                genero: 'animacao',
                duracao: 30,
                orcamento: 15000,
                prazo: new Date('2035-01-01'),
                papeisExigidos: [
                    {
                        papel: Papel.DIRETOR,
                        peso: 1
                    }
                ],
                motorGrafico: 'Blender',
                resolucaoEntrega: '4K'
            });

            const diretor = criarProfissional(
                'p1',
                'Diretor',
                [['direcao', 8]]
            );

            const resultado = fabrica
                .criarRecomendador()
                .recomendar(projetoSemEV, [diretor]);

            expect(
                resultado.get(Papel.EFEITOS_VISUAIS)
            ).toBeUndefined();
        }
    );
});