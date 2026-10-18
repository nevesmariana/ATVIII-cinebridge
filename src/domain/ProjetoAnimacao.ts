import { Projeto, PapelExigido } from './Projeto';

export class ProjetoAnimacao extends Projeto {
    constructor(
        id: string,
        genero: string,
        duracao: number,
        orcamento: number,
        prazo: Date,
        papeisExigidos: PapelExigido[],
        public readonly motorGrafico: string,
        public readonly resolucaoEntrega: string
    ) {
        super(
            id,
            genero,
            duracao,
            orcamento,
            prazo,
            papeisExigidos
        );
    }

    clonar(): ProjetoAnimacao {
        return new ProjetoAnimacao(
            this.id,
            this.genero,
            this.duracao,
            this.orcamento,
            new Date(this.prazo.getTime()),
            this.papeisExigidos.map((p) => ({ ...p })),
            this.motorGrafico,
            this.resolucaoEntrega
        );
    }
}