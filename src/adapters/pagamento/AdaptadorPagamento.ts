export type StatusPagamento =
    | 'APROVADO'
    | 'ESTORNADO'
    | 'NAO_ENCONTRADO';

export interface AdaptadorPagamento {
    efetuarPagamento(
        valor: number,
        origem: string,
        destino: string
    ): string;

    cancelarPagamento(id: string): boolean;

    verificarPagamento(id: string): string;
}