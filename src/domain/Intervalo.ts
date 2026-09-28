export class Intervalo {
    constructor(
        public readonly inicio: Date,
        public readonly fim: Date
    ) {
        if (inicio > fim) {
            throw new Error(
                'Data de inicio nao pode ser posterior a data de fim'
            );
        }
    }

    contem(data: Date): boolean {
        return data >= this.inicio && data <= this.fim;
    }

    sobrepoe(outro: Intervalo): boolean {
        return (
            this.inicio <= outro.fim &&
            outro.inicio <= this.fim
        );
    }
}