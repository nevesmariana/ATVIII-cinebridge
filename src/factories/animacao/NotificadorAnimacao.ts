import { Observador } from '../../observers/Observador';
import { EventoRecomendacao } from '../../domain/EventoRecomendacao';

export class NotificadorAnimacao implements Observador {
    atualizar(evento: EventoRecomendacao): void {
        console.log(
            `[ANIMACAO] Evento '${evento.tipo}' processado para a equipe de uma animacao.`
        );
    }
}