export class Avaliacao {
    constructor(
        public readonly nota: number,
        public readonly comentario: string,
        public readonly data: Date
    ) { }
}