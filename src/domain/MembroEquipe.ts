import { Papel } from './Papel';
import { Profissional } from './Profissional';

export class MembroEquipe {
    constructor(
        public readonly papel: Papel,
        public readonly profissional: Profissional,
        public confirmado: boolean = false
    ) { }

    confirmar(): void {
        this.confirmado = true;
    }
}