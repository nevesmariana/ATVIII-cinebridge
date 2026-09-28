export type TipoEvento =
    | 'RECOMENDACAO_GERADA'
    | 'MEMBRO_SUBSTITUIDO'
    | 'CONVITE_ACEITO'
    | 'CONVITE_RECUSADO'
    | 'EQUIPE_FORMADA';

export class EventoRecomendacao {
    constructor(
        public readonly tipo: TipoEvento,
        public readonly dados: Map<string, unknown>,
        public readonly origem: string
    ) { }
}