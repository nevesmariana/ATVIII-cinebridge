import { AdaptadorPagamento, StatusPagamento } from './AdaptadorPagamento';
import { PagSeguroSimulado } from '../../externos/PagSeguroSimulado';

export class AdaptadorPagSeguro implements AdaptadorPagamento {
    constructor(private readonly cliente: PagSeguroSimulado) { }

    efetuarPagamento(valor: number, origem: string, destino: string): string {
        const resposta = this.cliente.criarTransacao({
            valor: valor.toFixed(2),
            pagador: origem,
            recebedor: destino
        });
        return resposta.codigo;
    }

    cancelarPagamento(id: string): boolean {
        return this.cliente.cancelarTransacao(id).cancelada;
    }

    verificarPagamento(id: string): string {
        const t = this.cliente.consultarTransacao(id);
        let status: StatusPagamento;
        if (!t) {
            status = 'NAO_ENCONTRADO';
        } else if (t.status === 7) {
            status = 'ESTORNADO';
        } else {
            status = 'APROVADO';
        }
        return status;
    }
}