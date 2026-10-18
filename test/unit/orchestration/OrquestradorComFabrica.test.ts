
import { OrquestradorPadrao } from '../../../src/orchestration/OrquestradorPadrao';
import { RepositorioProfissional } from '../../../src/repositories/RepositorioProfissional';
import { FabricaDocumentario } from '../../../src/factories/documentario/FabricaDocumentario';
import { FabricaAnimacao } from '../../../src/factories/animacao/FabricaAnimacao';
import { Projeto } from '../../../src/domain/Projeto';
import { Profissional } from '../../../src/domain/Profissional';
import { Competencia } from '../../../src/domain/Competencia';
import { Intervalo } from '../../../src/domain/Intervalo';
import { Papel } from '../../../src/domain/Papel';

class RepositorioFalso implements RepositorioProfissional {
    constructor(
        private readonly profissionais: Profissional[]
    ) { }

    async listarTodos() {
        return this.profissionais;
    }

    async buscarPorId(id: string) {
        return this.profissionais.find(
            (p) => p.id === id
        );
    }
}

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

describe(
    'OrquestradorEquipe.orquestrarComFabrica (troca de fabrica)',
    () => {
        it(
            'a MESMA instancia de orquestrador atende generos diferentes so trocando a fabrica, sem nenhuma alteracao no codigo do orquestrador',
            async () => {
                const diretor = criarProfissional(
                    'p1',
                    'Diretor',
                    [
                        ['direcao', 8]
                    ]
                );

                const repositorio = new RepositorioFalso([
                    diretor
                ]);

                const orquestrador =
                    new OrquestradorPadrao(repositorio);

                const fabricaDoc =
                    new FabricaDocumentario();

                const projetoDoc = fabricaDoc.criarProjeto({
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
                    tema: 'teste',
                    entrevistados: ['A']
                });

                const equipeDoc = await orquestrador
                    .usarFabrica(fabricaDoc)
                    .orquestrarComFabrica(projetoDoc);

                expect(
                    equipeDoc.contem()[0].profissional.id
                ).toBe('p1');

                const fabricaAnim = new FabricaAnimacao();

                const projetoAnim = fabricaAnim.criarProjeto({
                    id: 'anim-1',
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

                const equipeAnim = await orquestrador
                    .usarFabrica(fabricaAnim)
                    .orquestrarComFabrica(projetoAnim);

                expect(
                    equipeAnim.contem()[0].profissional.id
                ).toBe('p1');
            }
        );

        it(
            'lanca erro se orquestrarComFabrica for chamado sem nenhuma fabrica configurada',
            async () => {
                const orquestrador = new OrquestradorPadrao(
                    new RepositorioFalso([])
                );

                const projeto = new Projeto(
                    'p1',
                    'doc',
                    60,
                    1000,
                    new Date('2035-01-01'),
                    [
                        {
                            papel: Papel.DIRETOR,
                            peso: 1
                        }
                    ]
                );

                await expect(
                    orquestrador.orquestrarComFabrica(projeto)
                ).rejects.toThrow();
            }
        );

        it(
            'orquestrarComFabrica lanca erro quando a equipe formada nao passa no validador especifico do genero',
            async () => {
                const diretor = criarProfissional(
                    'p1',
                    'Diretor',
                    [['direcao', 8]]
                );

                const orquestrador = new OrquestradorPadrao(
                    new RepositorioFalso([diretor])
                );

                const fabricaDoc = new FabricaDocumentario();

                const projetoInvalido = fabricaDoc.criarProjeto({
                    id: 'doc-invalido',
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

                await expect(
                    orquestrador
                        .usarFabrica(fabricaDoc)
                        .orquestrarComFabrica(projetoInvalido)
                ).rejects.toThrow();
            }
        );
    }
);
