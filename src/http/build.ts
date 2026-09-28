import Fastify, {
    FastifyInstance
} from 'fastify';

import { registrarRotas } from './rotas';

import { RepositorioProfissional } from '../repositories/RepositorioProfissional';

import { OrquestradorPadrao } from '../orchestration/OrquestradorPadrao';

import { SistemaRecomendacao } from '../observers/SistemaRecomendacao';

import { SimilaridadeCosseno } from '../strategies/SimilaridadeCosseno';

import { NotificadorEmail } from '../observers/NotificadorEmail';
import { NotificadorInterno } from '../observers/NotificadorInterno';
import { AuditoriaRecomendacao } from '../observers/AuditoriaRecomendacao';

// Extraido do server.ts para podermos 'montar' o app tanto em producao quanto em testes,
// passando qualquer implementacao de RepositorioProfissional (memoria ou Prisma).
export function buildApp(
    repositorio: RepositorioProfissional
): FastifyInstance {

    const app = Fastify({
        logger: false
    });

    const orquestrador =
        new OrquestradorPadrao(
            repositorio
        );

    const sistema =
        new SistemaRecomendacao(
            orquestrador,
            new SimilaridadeCosseno()
        );

    sistema.adicionarObservador(
        new NotificadorEmail()
    );

    sistema.adicionarObservador(
        new NotificadorInterno()
    );

    sistema.adicionarObservador(
        new AuditoriaRecomendacao()
    );

    registrarRotas(
        app,
        sistema
    );

    return app;
}