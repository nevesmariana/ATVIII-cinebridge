import { Projeto } from '../domain/Projeto';
import { Profissional } from '../domain/Profissional';

export interface VisitanteProjeto<T> {
    visitarProjeto(projeto: Projeto): T;
    visitarProfissional(profissional: Profissional): T;
}