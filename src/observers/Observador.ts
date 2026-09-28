import { EventoRecomendacao } from '../domain/EventoRecomendacao';

export interface Observador {
    atualizar(evento: EventoRecomendacao): void;
}