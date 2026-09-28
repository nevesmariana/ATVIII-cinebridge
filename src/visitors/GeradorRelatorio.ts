import { VisitanteProjeto } from './VisitanteProjeto';
import { Projeto } from '../domain/Projeto';
import { Profissional } from '../domain/Profissional';

export class GeradorRelatorio
    implements VisitanteProjeto<string> {

    visitarProjeto(
        projeto: Projeto
    ): string {

        const equipe = projeto.getEquipe();

        const linhas = [
            `Relatorio do Projeto ${projeto.id}`,
            `Genero: ${projeto.genero}`,
            `Orcamento: ${projeto.orcamento}`,
            `Prazo: ${projeto.prazo.toISOString()}`,
            `Papeis exigidos: ${projeto.exige().map((e) => e.papel).join(', ')}`
        ];

        if (equipe) {
            linhas.push('--- Equipe formada ---');

            for (const membro of equipe.contem()) {
                linhas.push(
                    this.visitarProfissional(
                        membro.profissional
                    )
                );
            }
        } else {
            linhas.push(
                'Equipe ainda nao formada.'
            );
        }

        return linhas.join('\n');
    }

    visitarProfissional(
        profissional: Profissional
    ): string {

        return `Profissional ${profissional.nome} (id: ${profissional.id}) - preco medio: ${profissional.precoMedio}`;
    }
}