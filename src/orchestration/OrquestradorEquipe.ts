import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';
import { Equipe } from '../domain/Equipe';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { RepositorioProfissional } from '../repositories/RepositorioProfissional';

export abstract class OrquestradorEquipe {

    constructor(
        protected readonly repositorio: RepositorioProfissional
    ) { }

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

        const normalizados = this.normalizarDados(
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

                jaAlocados.add(
                    escolhido.id
                );
            }
        }
        projeto.define(equipe);

        return equipe;
    }
}