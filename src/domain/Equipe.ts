import { Papel } from './Papel';
import { MembroEquipe } from './MembroEquipe';
import { Profissional } from './Profissional';

export class Equipe {
    private membros: MembroEquipe[] = [];

    constructor(
        public readonly id: string,
        public readonly dataFormacao: Date,
        public status: string = 'EM_FORMACAO'
    ) { }

    contem(): ReadonlyArray<MembroEquipe> {
        return this.membros;
    }

    aloca(
        papel: Papel,
        profissional: Profissional
    ): MembroEquipe {
        const membro = new MembroEquipe(papel, profissional);
        this.membros.push(membro);
        return membro;
    }

    substituir(
        papel: Papel,
        novoProfissional: Profissional
    ): void {
        const index = this.membros.findIndex(
            (m) => m.papel === papel
        );
        if (index === -1) {
            throw new Error(
                'Nenhum membro encontrado para o papel ' + papel
            );
        }
        this.membros[index] = new MembroEquipe(
            papel,
            novoProfissional
        );
    }

    papeisPreenchidos(): Papel[] {
        return this.membros.map((m) => m.papel);
    }
}