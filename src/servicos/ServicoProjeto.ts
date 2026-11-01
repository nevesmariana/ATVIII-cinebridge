import { PapelExigido } from '../domain/Projeto';

export interface ServicoProjeto {
    readonly nome: string;

    calcularCusto(): number;
    listarSubservicos(): ServicoProjeto[];
    obterPrazo(): number;
    validar(): boolean;
    listarPapeis(): PapelExigido[];
    clonar(): ServicoProjeto;
}