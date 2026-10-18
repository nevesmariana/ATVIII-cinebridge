import { RecomendacaoStrategy } from '../../strategies/RecomendacaoStrategy';
import { SimilaridadeCosseno } from '../../strategies/SimilaridadeCosseno';
import { Projeto } from '../../domain/Projeto';
import { Profissional } from '../../domain/Profissional';
import { Papel } from '../../domain/Papel';

export class RecomendadorPublicitario implements RecomendacaoStrategy {
    private readonly base = new SimilaridadeCosseno();

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        const resultado = this.base.recomendar(
            projeto,
            profissionais
        );

        const editores = resultado.get(Papel.EDITOR);

        if (editores) {
            resultado.set(
                Papel.EDITOR,
                [...editores].sort((a, b) => {
                    const aTemMotion = a.possui('motion-graphics') ? 1 : 0;
                    const bTemMotion = b.possui('motion-graphics') ? 1 : 0;

                    return bTemMotion - aTemMotion;
                })
            );
        }

        return resultado;
    }
}