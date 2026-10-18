import { Projeto, PapelExigido } from './Projeto';

export class ProjetoDocumentario extends Projeto {
    constructor(
        id: string,
        genero: string,
        duracao: number,
        orcamento: number,
        prazo: Date,
        papeisExigidos: PapelExigido[],
        public readonly tema: string,
        public readonly entrevistados: string[]
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

    clonar(): ProjetoDocumentario {
        return new ProjetoDocumentario(
            this.id,
            this.genero,
            this.duracao,
            this.orcamento,
            new Date(this.prazo.getTime()),
            this.papeisExigidos.map((p) => ({ ...p })),
            this.tema,
            [...this.entrevistados]
        );
    }
}