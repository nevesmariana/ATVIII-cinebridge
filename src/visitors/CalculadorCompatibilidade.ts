import { VisitanteProjeto } from './VisitanteProjeto';
import { Projeto } from '../domain/Projeto';
import { Profissional } from '../domain/Profissional';

export class CalculadorCompatibilidade
    implements VisitanteProjeto<number> {

    visitarProjeto(
        projeto: Projeto
    ): number {

        const equipe = projeto.getEquipe();

        if (
            !equipe ||
            equipe.contem().length === 0
        ) {
            return 0;
        }

        const notas = equipe
            .contem()
            .map((membro) =>
                this.visitarProfissional(
                    membro.profissional
                )
            );

        const soma = notas.reduce(
            (acc, n) => acc + n,
            0
        );

        return soma / notas.length;
    }

    visitarProfissional(
        profissional: Profissional
    ): number {

        if (profissional.competencias.length === 0) {
            return 0;
        }

        const somaNiveis =
            profissional.competencias.reduce(
                (acc, c) => acc + c.nivel,
                0
            );

        const mediaCompetencias =
            somaNiveis /
            profissional.competencias.length;

        const mediaAvaliacoes =
            profissional.mediaAvaliacoes();
        return (
            mediaCompetencias +
            mediaAvaliacoes
        ) / 2;
    }
}