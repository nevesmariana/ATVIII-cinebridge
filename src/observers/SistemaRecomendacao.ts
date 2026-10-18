import { Observador } from './Observador';
import { EventoRecomendacao } from '../domain/EventoRecomendacao';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { OrquestradorEquipe } from '../orchestration/OrquestradorEquipe';
import { FabricaProjeto } from '../factories/FabricaProjeto';
import { Projeto } from '../domain/Projeto';
import { Equipe } from '../domain/Equipe';

export class SistemaRecomendacao {
    private observadores: Observador[] = [];
    private estrategiaAtual: RecomendacaoStrategy;
    private readonly fabricas = new Map<string, FabricaProjeto>();

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

    registrarFabrica(
        tipoProjeto: string,
        fabrica: FabricaProjeto
    ): void {
        this.fabricas.set(
            tipoProjeto,
            fabrica
        );
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

    async executarRecomendacaoPorGenero(
        tipoProjeto: string,
        dadosProjeto: any
    ): Promise<{ projeto: Projeto; equipe: Equipe }> {
        const fabrica = this.fabricas.get(tipoProjeto);

        if (!fabrica) {
            throw new Error(
                `Nenhuma fabrica registrada para o tipo de projeto '${tipoProjeto}'`
            );
        }

        const projeto = fabrica.criarProjeto(dadosProjeto);

        const equipe = await this.orquestrador
            .usarFabrica(fabrica)
            .orquestrarComFabrica(projeto);

        const evento = new EventoRecomendacao(
            'RECOMENDACAO_GERADA',
            new Map<string, unknown>([
                ['projetoId', projeto.id],
                ['equipeId', equipe.id],
                ['tipoProjeto', tipoProjeto]
            ]),
            'SistemaRecomendacao'
        );

        this.notificarObservadores(evento);

        fabrica.criarNotificador().atualizar(evento);

        return { projeto, equipe };
    }
}