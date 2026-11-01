import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { SimilaridadeCosseno } from './SimilaridadeCosseno';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

export class RecomendadorBase implements RecomendacaoStrategy {
    constructor(
        private readonly motor: RecomendacaoStrategy = new SimilaridadeCosseno()
    ) { }

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        return this.motor.recomendar(projeto, profissionais);
    }
}