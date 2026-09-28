import { VisitanteProjeto } from './VisitanteProjeto';
import { Projeto } from '../domain/Projeto';
import { Profissional } from '../domain/Profissional';

export class ValidadorConsistencia
    implements VisitanteProjeto<boolean> {

    visitarProjeto(
        projeto: Projeto
    ): boolean {

        const equipe = projeto.getEquipe();

        if (!equipe) {
            return false;
        }

        const papeisExigidos = projeto
            .exige()
            .map((e) => e.papel);

        const papeisPreenchidos =
            equipe.papeisPreenchidos();

        const todosPapeisPreenchidos =
            papeisExigidos.every(
                (p) => papeisPreenchidos.includes(p)
            );

        const orcamentoPositivo =
            projeto.orcamento > 0;

        return (
            todosPapeisPreenchidos &&
            orcamentoPositivo
        );
    }

    visitarProfissional(
        profissional: Profissional
    ): boolean {

        const temCompetencias =
            profissional.competencias.length > 0;

        const precoValido =
            profissional.precoMedio > 0;

        return (
            temCompetencias &&
            precoValido
        );
    }
}