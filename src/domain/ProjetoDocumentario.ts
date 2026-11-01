import { Projeto, ServicoOuPapeis } from './Projeto';

export class ProjetoDocumentario extends Projeto {
    constructor(
        id: string,
        genero: string,
        duracao: number,
        orcamento: number,
        prazo: Date,
        servicoOuPapeis: ServicoOuPapeis,
        public readonly tema: string,
        public readonly entrevistados: string[]
    ) {
        super(
            id,
            genero,
            duracao,
            orcamento,
            prazo,
            servicoOuPapeis
        );
    }

    clonar(): ProjetoDocumentario {
        return new ProjetoDocumentario(
            this.id,
            this.genero,
            this.duracao,
            this.orcamento,
            new Date(this.prazo.getTime()),
            this.servicoPrincipal.clonar(),
            this.tema,
            [...this.entrevistados]
        );
    }
}