import { Projeto, ServicoOuPapeis } from './Projeto';

export class ProjetoPublicitario extends Projeto {
    constructor(
        id: string,
        genero: string,
        duracao: number,
        orcamento: number,
        prazo: Date,
        servicoOuPapeis: ServicoOuPapeis,
        public readonly cliente: string,
        public readonly plataformasDistribuicao: string[]
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

    clonar(): ProjetoPublicitario {
        return new ProjetoPublicitario(
            this.id,
            this.genero,
            this.duracao,
            this.orcamento,
            new Date(this.prazo.getTime()),
            this.servicoPrincipal.clonar(),
            this.cliente,
            [...this.plataformasDistribuicao]
        );
    }
}