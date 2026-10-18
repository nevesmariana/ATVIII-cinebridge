import { Projeto } from '../domain/Projeto';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { VisitanteProjeto } from '../visitors/VisitanteProjeto';
import { Observador } from '../observers/Observador';

export interface FabricaProjeto {
    criarProjeto(dados: any): Projeto;

    criarValidador(): VisitanteProjeto<boolean>;

    criarRecomendador(): RecomendacaoStrategy;

    criarNotificador(): Observador;
}