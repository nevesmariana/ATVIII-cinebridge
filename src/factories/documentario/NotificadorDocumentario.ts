import { Observador } from '../../observers/Observador';
import { EventoRecomendacao } from '../../domain/EventoRecomendacao';

export class NotificadorDocumentario implements Observador {
    atualizar(evento: EventoRecomendacao): void {
        console.log(
            `[DOCUMENTARIO] Evento '${evento.tipo}' processado para a equipe de um documentario.`
        );
    }
}