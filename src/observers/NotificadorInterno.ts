import { Observador } from './Observador';
import { EventoRecomendacao } from '../domain/EventoRecomendacao';

export class NotificadorInterno implements Observador {

    atualizar(
        evento: EventoRecomendacao
    ): void {
        console.log(
            `[MENSAGEM INTERNA] Evento '${evento.tipo}' recebido de '${evento.origem}'. Notificando na plataforma...`
        );
    }
}