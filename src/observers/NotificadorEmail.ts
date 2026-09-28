import { Observador } from './Observador';
import { EventoRecomendacao } from '../domain/EventoRecomendacao';

export class NotificadorEmail implements Observador {

    atualizar(
        evento: EventoRecomendacao
    ): void {
        console.log(
            `[EMAIL] Evento '${evento.tipo}' recebido de '${evento.origem}'. Enviando e-mail...`
        );

    }
}