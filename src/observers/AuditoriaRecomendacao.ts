import { Observador } from './Observador';
import { EventoRecomendacao } from '../domain/EventoRecomendacao';

export class AuditoriaRecomendacao implements Observador {

    private logs: EventoRecomendacao[] = [];

    atualizar(
        evento: EventoRecomendacao
    ): void {

        this.logs.push(evento);

        console.log(
            `[AUDITORIA] Evento registrado: ${evento.tipo} em ${new Date().toISOString()}`
        );
    }

    obterLogs(): ReadonlyArray<EventoRecomendacao> {
        return this.logs;
    }
}