import { RecomendacaoStrategy } from '../../strategies/RecomendacaoStrategy';
import { SimilaridadeCosseno } from '../../strategies/SimilaridadeCosseno';
import { Projeto } from '../../domain/Projeto';
import { Profissional } from '../../domain/Profissional';
import { Papel } from '../../domain/Papel';

export class RecomendadorAnimacao implements RecomendacaoStrategy {
    private readonly base = new SimilaridadeCosseno();

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        const resultado = this.base.recomendar(
            projeto,
            profissionais
        );

        const efeitosVisuais = resultado.get(Papel.EFEITOS_VISUAIS);

        if (efeitosVisuais) {
            resultado.set(
                Papel.EFEITOS_VISUAIS,
                [...efeitosVisuais].sort((a, b) => {
                    const aTemModelagem = a.possui('modelagem3d') ? 1 : 0;
                    const bTemModelagem = b.possui('modelagem3d') ? 1 : 0;

                    return bTemModelagem - aTemModelagem;
                })
            );
        }

        return resultado;
    }
}