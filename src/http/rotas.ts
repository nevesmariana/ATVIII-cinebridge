
import { FastifyInstance } from 'fastify';
import { Papel } from '../domain/Papel';
import { Projeto } from '../domain/Projeto';
import { SistemaRecomendacao } from '../observers/SistemaRecomendacao';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { SimilaridadeCosseno } from '../strategies/SimilaridadeCosseno';
import { FiltragemColaborativa } from '../strategies/FiltragemColaborativa';
import { RegrasOrcamento } from '../strategies/RegrasOrcamento';

interface CorpoRecomendacao {
    estrategia?:
    | 'similaridadeCosseno'
    | 'filtragemColaborativa'
    | 'regrasOrcamento';

    projeto: {
        id: string;
        genero: string;
        duracao: number;
        orcamento: number;
        prazo: string;
        papeisExigidos: {
            papel: Papel;
            peso: number;
        }[];
    };
}

function resolverEstrategia(
    nome?: string
): RecomendacaoStrategy {
    switch (nome) {
        case 'filtragemColaborativa':
            return new FiltragemColaborativa();

        case 'regrasOrcamento':
            return new RegrasOrcamento();

        default:
            return new SimilaridadeCosseno();
    }
}

export function registrarRotas(
    app: FastifyInstance,
    sistema: SistemaRecomendacao
): void {
    // Rota da Atividade 1: estratégia escolhida manualmente
    // no corpo da requisição.
    app.post<{ Body: CorpoRecomendacao }>(
        '/recomendacoes',
        async (request, reply) => {
            const {
                projeto: dadosProjeto,
                estrategia
            } = request.body;

            if (!dadosProjeto) {
                return reply.status(400).send({
                    erro: 'Campo "projeto" e obrigatorio'
                });
            }

            const projeto = new Projeto(
                dadosProjeto.id,
                dadosProjeto.genero,
                dadosProjeto.duracao,
                dadosProjeto.orcamento,
                new Date(dadosProjeto.prazo),
                dadosProjeto.papeisExigidos
            );

            sistema.definirEstrategia(
                resolverEstrategia(estrategia)
            );

            try {
                const equipe =
                    await sistema.executarRecomendacao(projeto);

                return reply.status(200).send({
                    projetoId: projeto.id,
                    equipeId: equipe.id,
                    membros: equipe.contem().map((m) => ({
                        papel: m.papel,
                        profissionalId: m.profissional.id,
                        profissionalNome: m.profissional.nome
                    }))
                });
            } catch (erro) {
                return reply.status(422).send({
                    erro: (erro as Error).message
                });
            }
        }
    );

    app.post<{
        Params: { tipo: string };
        Body: { dados: any };
    }>(
        '/recomendacoes/:tipo',
        async (request, reply) => {
            const { tipo } = request.params;
            const { dados } = request.body;

            if (!dados) {
                return reply.status(400).send({
                    erro: 'Campo "dados" e obrigatorio'
                });
            }

            const dadosConvertidos = {
                ...dados,
                prazo: new Date(dados.prazo)
            };

            try {
                const { projeto, equipe } =
                    await sistema.executarRecomendacaoPorGenero(
                        tipo,
                        dadosConvertidos
                    );

                return reply.status(200).send({
                    tipoProjeto: tipo,
                    projetoId: projeto.id,
                    equipeId: equipe.id,
                    membros: equipe.contem().map((m) => ({
                        papel: m.papel,
                        profissionalId: m.profissional.id,
                        profissionalNome: m.profissional.nome
                    }))
                });
            } catch (erro) {
                return reply.status(422).send({
                    erro: (erro as Error).message
                });
            }
        }
    );
}
