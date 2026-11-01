import { Papel } from '../domain/Papel';
import { ServicoProjeto } from './ServicoProjeto';
import { PapelExigido } from '../domain/Projeto';

export class ServicoAtomico implements ServicoProjeto {
    constructor(
        public readonly nome: string,
        public readonly custo: number,
        public readonly prazoDias: number,
        public readonly papel: Papel,
        public readonly peso: number = 1
    ) { }

    calcularCusto(): number {
        return this.custo;
    }

    listarSubservicos(): ServicoProjeto[] {
        return [];
    }

    obterPrazo(): number {
        return this.prazoDias;
    }

    listarPapeis(): PapelExigido[] {
        return [{ papel: this.papel, peso: this.peso }];
    }

    clonar(): ServicoAtomico {
        return new ServicoAtomico(
            this.nome,
            this.custo,
            this.prazoDias,
            this.papel,
            this.peso
        );
    }

    validar(): boolean {
        return (
            this.nome.trim().length > 0 &&
            this.custo >= 0 &&
            this.prazoDias > 0 &&
            this.peso > 0 &&
            Object.values(Papel).includes(this.papel)
        );
    }
}