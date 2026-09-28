import { Competencia } from './Competencia';
import { Avaliacao } from './Avaliacao';
import { Intervalo } from './Intervalo';
import { VisitanteProjeto } from '../visitors/VisitanteProjeto';

export class Profissional {
    private readonly avaliacoes: Avaliacao[] = [];

    constructor(
        public readonly id: string,
        public readonly nome: string,
        public readonly competencias: Competencia[],
        public readonly disponibilidade: Intervalo,
        public readonly precoMedio: number
    ) { }

    possui(nomeCompetencia: string): Competencia | undefined {
        return this.competencias.find(
            (c) => c.nome === nomeCompetencia
        );
    }

    recebe(avaliacao: Avaliacao): void {
        this.avaliacoes.push(avaliacao);
    }

    mediaAvaliacoes(): number {
        if (this.avaliacoes.length === 0) {
            return 0;
        }
        const soma = this.avaliacoes.reduce(
            (acc, a) => acc + a.nota,
            0
        );
        return soma / this.avaliacoes.length;
    }

    aceitar<T>(
        visitante: VisitanteProjeto<T>
    ): T {
        return visitante.visitarProfissional(this);
    }
}