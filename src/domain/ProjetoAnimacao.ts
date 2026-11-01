import { Projeto, ServicoOuPapeis } from './Projeto';

export class ProjetoAnimacao extends Projeto {
    constructor(
        id: string,
        genero: string,
        duracao: number,
        orcamento: number,
        prazo: Date,
        servicoOuPapeis: ServicoOuPapeis,
        public readonly motorGrafico: string,
        public readonly resolucaoEntrega: string
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

    clonar(): ProjetoAnimacao {
        return new ProjetoAnimacao(
            this.id,
            this.genero,
            this.duracao,
            this.orcamento,
            new Date(this.prazo.getTime()),
            this.servicoPrincipal.clonar(),
            this.motorGrafico,
            this.resolucaoEntrega
        );
    }
}