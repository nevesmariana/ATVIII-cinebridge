import { Observador } from './Observador';
import { EventoRecomendacao } from '../domain/EventoRecomendacao';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { OrquestradorEquipe } from '../orchestration/OrquestradorEquipe';
import { FabricaProjeto } from '../factories/FabricaProjeto';
import { Projeto } from '../domain/Projeto';
import { Equipe } from '../domain/Equipe';
import { Profissional } from '../domain/Profissional';
import { AdaptadorArmazenamento } from '../adapters/armazenamento/AdaptadorArmazenamento';
import { AdaptadorPagamento } from '../adapters/pagamento/AdaptadorPagamento';
import { AdaptadorProfissional } from '../adapters/profissional/AdaptadorProfissional';

export class SistemaRecomendacao {
    private observadores: Observador[] = [];
    private estrategiaAtual: RecomendacaoStrategy;
    private readonly fabricas = new Map<string, FabricaProjeto>();
    private adaptadorArmazenamento?: AdaptadorArmazenamento;
    private adaptadorPagamento?: AdaptadorPagamento;
    private adaptadorProfissional?: AdaptadorProfissional;

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

    configurarAdaptadores(
        armazenamento: AdaptadorArmazenamento,
        pagamento: AdaptadorPagamento,
        profissional: AdaptadorProfissional
    ): void {
        this.adaptadorArmazenamento = armazenamento;
        this.adaptadorPagamento = pagamento;
        this.adaptadorProfissional = profissional;
    }

    anexarArquivoAoProjeto(
        projetoId: string,
        nomeArquivo: string,
        conteudo: Buffer
    ): string {
        return this.armazenamento().salvarArquivo(conteudo, {
            pasta: `projetos/${projetoId}`,
            nome: nomeArquivo
        });
    }

    listarArquivosDoProjeto(projetoId: string): string[] {
        return this.armazenamento().listarArquivos(
            `projetos/${projetoId}`
        );
    }

    recuperarArquivo(id: string): Buffer {
        return this.armazenamento().recuperarArquivo(id);
    }

    pagarProfissional(
        valor: number,
        produtorId: string,
        profissionalId: string
    ): string {
        if (valor <= 0) {
            throw new Error('Valor do pagamento deve ser positivo');
        }
        return this.pagamento().efetuarPagamento(
            valor,
            produtorId,
            profissionalId
        );
    }

    estornarPagamento(idPagamento: string): boolean {
        return this.pagamento().cancelarPagamento(idPagamento);
    }

    consultarPagamento(idPagamento: string): string {
        return this.pagamento().verificarPagamento(idPagamento);
    }

    buscarProfissionaisExternos(criterios: any): Profissional[] {
        return this.profissional().listarProfissionais(criterios);
    }

    avaliarProfissional(id: string, nota: number, comentario = ''): void {
        this.profissional().registrarAvaliacao(id, { nota, comentario });
    }

    private armazenamento(): AdaptadorArmazenamento {
        if (!this.adaptadorArmazenamento) {
            throw new Error('Adaptador de armazenamento nao configurado');
        }
        return this.adaptadorArmazenamento;
    }

    private pagamento(): AdaptadorPagamento {
        if (!this.adaptadorPagamento) {
            throw new Error('Adaptador de pagamento nao configurado');
        }
        return this.adaptadorPagamento;
    }

    private profissional(): AdaptadorProfissional {
        if (!this.adaptadorProfissional) {
            throw new Error('Adaptador de profissional nao configurado');
        }
        return this.adaptadorProfissional;
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