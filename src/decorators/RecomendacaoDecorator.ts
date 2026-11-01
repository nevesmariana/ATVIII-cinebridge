import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

export abstract class RecomendacaoDecorator implements RecomendacaoStrategy {
    protected constructor(
        protected readonly interno: RecomendacaoStrategy
    ) { }

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        return this.interno.recomendar(projeto, profissionais);
    }
}