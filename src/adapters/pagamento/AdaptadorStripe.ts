import { AdaptadorPagamento, StatusPagamento } from './AdaptadorPagamento';
import { StripeSimulado } from '../../externos/StripeSimulado';

export class AdaptadorStripe implements AdaptadorPagamento {
    constructor(private readonly cliente: StripeSimulado) { }

    efetuarPagamento(valor: number, origem: string, destino: string): string {
        const cobranca = this.cliente.createCharge({
            amount: Math.round(valor * 100),
            currency: 'brl',
            metadata: { origem, destino }
        });
        return cobranca.id;
    }

    cancelarPagamento(id: string): boolean {
        return this.cliente.refund(id).status === 'succeeded';
    }

    verificarPagamento(id: string): string {
        const cobranca = this.cliente.retrieveCharge(id);
        const mapa: StatusPagamento = !cobranca
            ? 'NAO_ENCONTRADO'
            : cobranca.status === 'refunded'
                ? 'ESTORNADO'
                : 'APROVADO';
        return mapa;
    }
}