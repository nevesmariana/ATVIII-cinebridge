import { Observador } from './Observador';
import { EventoRecomendacao } from '../domain/EventoRecomendacao';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { OrquestradorEquipe } from '../orchestration/OrquestradorEquipe';
import { Projeto } from '../domain/Projeto';
import { Equipe } from '../domain/Equipe';

export class SistemaRecomendacao {

    private observadores: Observador[] = [];
    private estrategiaAtual: RecomendacaoStrategy;

    constructor(
        private readonly orquestrador: OrquestradorEquipe,
        estrategiaInicial: RecomendacaoStrategy
    ) {
        this.estrategiaAtual = estrategiaInicial;
    }

    definirEstrategia(
        estrategia: RecomendacaoStrategy
    ): void {
        this.estrategiaAtual = estrategia;
    }

    adicionarObservador(
        obs: Observador
    ): void {
        this.observadores.push(obs);
    }

    notificarObservadores(
        evento: EventoRecomendacao
    ): void {

        for (const observador of this.observadores) {
            observador.atualizar(evento);
        }
    }

    async executarRecomendacao(
        projeto: Projeto
    ): Promise<Equipe> {
        const equipe =
            await this.orquestrador.orquestrar(
                projeto,
                this.estrategiaAtual
            );

        const evento =
            new EventoRecomendacao(
                'RECOMENDACAO_GERADA',
                new Map<string, unknown>([
                    ['projetoId', projeto.id],
                    ['equipeId', equipe.id]
                ]),
                'SistemaRecomendacao'
            );

        this.notificarObservadores(evento);

        return equipe;
    }
}