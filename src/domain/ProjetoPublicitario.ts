import { Projeto, PapelExigido } from './Projeto';

export class ProjetoPublicitario extends Projeto {
    constructor(
        id: string,
        genero: string,
        duracao: number,
        orcamento: number,
        prazo: Date,
        papeisExigidos: PapelExigido[],
        public readonly cliente: string,
        public readonly plataformasDistribuicao: string[]
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

    clonar(): ProjetoPublicitario {
        return new ProjetoPublicitario(
            this.id,
            this.genero,
            this.duracao,
            this.orcamento,
            new Date(this.prazo.getTime()),
            this.papeisExigidos.map((p) => ({ ...p })),
            this.cliente,
            [...this.plataformasDistribuicao]
        );
    }
}