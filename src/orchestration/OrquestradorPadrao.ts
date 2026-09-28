import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';
import { OrquestradorEquipe } from './OrquestradorEquipe';

// Implementação concreta do Template Method
export class OrquestradorPadrao extends OrquestradorEquipe {

    protected validarRestricoes(
        projeto: Projeto
    ): boolean {

        const temPapeis =
            projeto.exige().length > 0;

        const orcamentoValido =
            projeto.orcamento > 0;

        const prazoNoFuturo =
            projeto.prazo.getTime() > Date.now();

        return (
            temPapeis &&
            orcamentoValido &&
            prazoNoFuturo
        );
    }

    protected normalizarDados(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Profissional[] {

        // Remove profissionais sem competências cadastradas
        // e que não estão disponíveis no prazo do projeto
        return profissionais.filter(
            (p) =>
                p.competencias.length > 0 &&
                p.disponibilidade.contem(projeto.prazo)
        );
    }

    protected posProcessar(
        recomendacoes: Map<Papel, Profissional[]>
    ): Map<Papel, Profissional[]> {

        // Limita a no máximo 5 candidatos por papel,
        // para não sobrecarregar o produtor de opções
        const resultado =
            new Map<Papel, Profissional[]>();

        for (const [papel, candidatos] of recomendacoes) {
            resultado.set(
                papel,
                candidatos.slice(0, 5)
            );
        }

        return resultado;
    }
}