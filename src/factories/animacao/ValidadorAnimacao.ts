import { VisitanteProjeto } from '../../visitors/VisitanteProjeto';
import { ValidadorConsistencia } from '../../visitors/ValidadorConsistencia';
import { Projeto } from '../../domain/Projeto';
import { ProjetoAnimacao } from '../../domain/ProjetoAnimacao';
import { Profissional } from '../../domain/Profissional';

export class ValidadorAnimacao implements VisitanteProjeto<boolean> {
    private readonly base = new ValidadorConsistencia();

    visitarProjeto(projeto: Projeto): boolean {
        const consistenciaBasica = projeto.aceitar(this.base);

        if (!consistenciaBasica) {
            return false;
        }

        if (projeto instanceof ProjetoAnimacao) {
            return projeto.motorGrafico.trim().length > 0;
        }

        return true;
    }

    visitarProfissional(profissional: Profissional): boolean {
        return this.base.visitarProfissional(profissional);
    }
}