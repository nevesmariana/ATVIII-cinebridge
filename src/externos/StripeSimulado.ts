export interface CobrancaStripe {
    id: string;
    amount: number;
    currency: string;
    status: 'succeeded' | 'refunded';
    metadata: Record<string, string>;
}

export class StripeSimulado {
    private readonly cobrancas = new Map<string, CobrancaStripe>();
    private contador = 0;

    createCharge(params: {
        amount: number;
        currency: string;
        metadata: Record<string, string>;
    }): CobrancaStripe {
        this.contador += 1;
        const cobranca: CobrancaStripe = {
            id: `ch_${this.contador}`,
            amount: params.amount,
            currency: params.currency,
            status: 'succeeded',
            metadata: params.metadata
        };
        this.cobrancas.set(cobranca.id, cobranca);
        return cobranca;
    }

    refund(chargeId: string): { status: 'succeeded' | 'failed' } {
        const cobranca = this.cobrancas.get(chargeId);
        if (!cobranca || cobranca.status === 'refunded') {
            return { status: 'failed' };
        }
        cobranca.status = 'refunded';
        return { status: 'succeeded' };
    }

    retrieveCharge(chargeId: string): CobrancaStripe | null {
        return this.cobrancas.get(chargeId) ?? null;
    }
}