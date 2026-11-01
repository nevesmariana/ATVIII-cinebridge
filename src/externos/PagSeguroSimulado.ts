export interface TransacaoPagSeguro {
    codigo: string;
    valor: string;
    pagador: string;
    recebedor: string;
    status: 3 | 7;
}

export class PagSeguroSimulado {
    private readonly transacoes = new Map<string, TransacaoPagSeguro>();
    private contador = 0;

    criarTransacao(dados: {
        valor: string;
        pagador: string;
        recebedor: string;
    }): { codigo: string; status: number } {
        this.contador += 1;
        const transacao: TransacaoPagSeguro = {
            codigo: `PS-${this.contador}`,
            valor: dados.valor,
            pagador: dados.pagador,
            recebedor: dados.recebedor,
            status: 3
        };
        this.transacoes.set(transacao.codigo, transacao);
        return { codigo: transacao.codigo, status: transacao.status };
    }

    cancelarTransacao(codigo: string): { cancelada: boolean } {
        const transacao = this.transacoes.get(codigo);
        if (!transacao || transacao.status === 7) {
            return { cancelada: false };
        }
        transacao.status = 7;
        return { cancelada: true };
    }

    consultarTransacao(
        codigo: string
    ): { codigo: string; status: number } | null {
        const t = this.transacoes.get(codigo);
        return t ? { codigo: t.codigo, status: t.status } : null;
    }
}