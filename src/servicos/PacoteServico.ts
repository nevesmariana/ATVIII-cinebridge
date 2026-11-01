import { ServicoProjeto } from './ServicoProjeto';
import { PapelExigido } from '../domain/Projeto';

export class PacoteServico implements ServicoProjeto {
    private readonly filhos: ServicoProjeto[] = [];

    constructor(public readonly nome: string) { }

    adicionar(servico: ServicoProjeto): this {
        if (servico === this || this.contemNaArvore(servico, this)) {
            throw new Error(
                'Ciclo detectado: um pacote nao pode conter a si mesmo'
            );
        }
        this.filhos.push(servico);
        return this;
    }

    remover(servico: ServicoProjeto): boolean {
        const i = this.filhos.indexOf(servico);
        if (i === -1) {
            return false;
        }
        this.filhos.splice(i, 1);
        return true;
    }

    calcularCusto(): number {
        return this.filhos.reduce(
            (total, f) => total + f.calcularCusto(),
            0
        );
    }

    listarSubservicos(): ServicoProjeto[] {
        return [...this.filhos];
    }

    obterPrazo(): number {
        return this.filhos.reduce(
            (total, f) => total + f.obterPrazo(),
            0
        );
    }

    listarPapeis(): PapelExigido[] {
        return this.filhos.flatMap((f) => f.listarPapeis());
    }

    clonar(): PacoteServico {
        const copia = new PacoteServico(this.nome);
        for (const filho of this.filhos) {
            copia.adicionar(filho.clonar());
        }
        return copia;
    }

    validar(): boolean {
        return (
            this.nome.trim().length > 0 &&
            this.filhos.length > 0 &&
            this.filhos.every((f) => f.validar())
        );
    }

    private contemNaArvore(
        raiz: ServicoProjeto,
        alvo: ServicoProjeto
    ): boolean {
        return raiz
            .listarSubservicos()
            .some((f) => f === alvo || this.contemNaArvore(f, alvo));
    }
}