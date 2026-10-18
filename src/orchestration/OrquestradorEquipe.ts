import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';
import { Equipe } from '../domain/Equipe';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { RepositorioProfissional } from '../repositories/RepositorioProfissional';
import { FabricaProjeto } from '../factories/FabricaProjeto';

export abstract class OrquestradorEquipe {
    protected fabrica?: FabricaProjeto;

    constructor(
        protected readonly repositorio: RepositorioProfissional,
        fabrica?: FabricaProjeto
    ) {
        this.fabrica = fabrica;
    }

    usarFabrica(fabrica: FabricaProjeto): this {
        this.fabrica = fabrica;
        return this;
    }

    async orquestrar(
        projeto: Projeto,
        estrategia: RecomendacaoStrategy
    ): Promise<Equipe> {
        if (!this.validarRestricoes(projeto)) {
            throw new Error(
                'Projeto nao atende as restricoes minimas para orquestracao'
            );
        }

        const candidatos =
            await this.repositorio.listarTodos();

        const normalizados =
            this.normalizarDados(
                projeto,
                candidatos
            );

        const recomendacoesBrutas =
            estrategia.recomendar(
                projeto,
                normalizados
            );

        const recomendacoesFinais =
            this.posProcessar(
                recomendacoesBrutas
            );

        return this.montarEquipe(
            projeto,
            recomendacoesFinais
        );
    }

    async orquestrarComFabrica(
        projeto: Projeto
    ): Promise<Equipe> {
        if (!this.fabrica) {
            throw new Error(
                'Nenhuma FabricaProjeto foi configurada neste orquestrador'
            );
        }

        const equipe =
            await this.orquestrar(
                projeto,
                this.fabrica.criarRecomendador()
            );

        const validador =
            this.fabrica.criarValidador();

        if (!projeto.aceitar(validador)) {
            throw new Error(
                'A equipe formada nao atende as regras de consistencia deste genero de projeto'
            );
        }

        return equipe;
    }

    getRepositorio(): RepositorioProfissional {
        return this.repositorio;
    }

    protected abstract validarRestricoes(
        projeto: Projeto
    ): boolean;

    protected abstract normalizarDados(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Profissional[];

    protected abstract posProcessar(
        recomendacoes: Map<Papel, Profissional[]>
    ): Map<Papel, Profissional[]>;

    private montarEquipe(
        projeto: Projeto,
        recomendacoes: Map<Papel, Profissional[]>
    ): Equipe {
        const equipe = new Equipe(
            `equipe-${projeto.id}`,
            new Date()
        );

        const jaAlocados = new Set<string>();

        for (const [papel, candidatos] of recomendacoes) {
            const escolhido = candidatos.find(
                (c) => !jaAlocados.has(c.id)
            );

            if (escolhido) {
                equipe.aloca(
                    papel,
                    escolhido
                );

                jaAlocados.add(escolhido.id);
            }
        }

        projeto.define(equipe);

        return equipe;
    }
}