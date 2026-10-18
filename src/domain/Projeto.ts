import { Papel } from './Papel';
import { Equipe } from './Equipe';
import { Profissional } from './Profissional';
import { VisitanteProjeto } from '../visitors/VisitanteProjeto';

export interface PapelExigido {
    papel: Papel;
    peso: number;
}

export class Projeto {
    private equipe: Equipe | null = null;
    private reavaliacaoSolicitada = false;

    constructor(
        public readonly id: string,
        public readonly genero: string,
        public readonly duracao: number,
        public readonly orcamento: number,
        public readonly prazo: Date,
        public readonly papeisExigidos: PapelExigido[]
    ) { }

    define(equipe: Equipe): void {
        this.equipe = equipe;
    }

    exige(): ReadonlyArray<PapelExigido> {
        return this.papeisExigidos;
    }

    getEquipe(): Equipe | null {
        return this.equipe;
    }

    aceitarRecomendacao(
        papel: Papel,
        profissional: Profissional
    ): void {
        if (!this.equipe) {
            throw new Error(
                'Projeto ainda nao possui equipe definida'
            );
        }
        const membro = this.equipe.aloca(papel, profissional);
        membro.confirmar();
    }

    substituirMembro(
        papel: Papel,
        novoProfissional: Profissional
    ): void {
        if (!this.equipe) {
            throw new Error(
                'Projeto ainda nao possui equipe definida'
            );
        }
        this.equipe.substituir(papel, novoProfissional);
    }

    solicitarReavaliacao(): void {
        this.reavaliacaoSolicitada = true;
    }

    consumirSolicitacaoReavaliacao(): boolean {
        const solicitado = this.reavaliacaoSolicitada;
        this.reavaliacaoSolicitada = false;
        return solicitado;
    }

    clonar(): Projeto {
        return new Projeto(
            this.id,
            this.genero,
            this.duracao,
            this.orcamento,
            new Date(this.prazo.getTime()),
            this.papeisExigidos.map((p) => ({ ...p }))
        );
    }

    aceitar<T>(
        visitante: VisitanteProjeto<T>
    ): T {
        return visitante.visitarProjeto(this);
    }
}