import { Observador } from '../../observers/Observador';
import { EventoRecomendacao } from '../../domain/EventoRecomendacao';

export class NotificadorPublicitario implements Observador {
    atualizar(evento: EventoRecomendacao): void {
        console.log(
            `[PUBLICITARIO] Evento '${evento.tipo}' processado para a equipe de uma peca publicitaria.`
        );
    }
}