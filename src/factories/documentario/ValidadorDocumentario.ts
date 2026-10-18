import { VisitanteProjeto } from '../../visitors/VisitanteProjeto';
import { ValidadorConsistencia } from '../../visitors/ValidadorConsistencia';
import { Projeto } from '../../domain/Projeto';
import { ProjetoDocumentario } from '../../domain/ProjetoDocumentario';
import { Profissional } from '../../domain/Profissional';

export class ValidadorDocumentario implements VisitanteProjeto<boolean> {
    private readonly base = new ValidadorConsistencia();

    visitarProjeto(projeto: Projeto): boolean {
        const consistenciaBasica = projeto.aceitar(this.base);

        if (!consistenciaBasica) {
            return false;
        }

        if (projeto instanceof ProjetoDocumentario) {
            return projeto.entrevistados.length > 0;
        }

        return true;
    }

    visitarProfissional(profissional: Profissional): boolean {
        return this.base.visitarProfissional(profissional);
    }
}