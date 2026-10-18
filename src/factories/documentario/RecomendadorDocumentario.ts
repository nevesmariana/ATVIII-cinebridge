import { RecomendacaoStrategy } from '../../strategies/RecomendacaoStrategy';
import { SimilaridadeCosseno } from '../../strategies/SimilaridadeCosseno';
import { Projeto } from '../../domain/Projeto';
import { Profissional } from '../../domain/Profissional';
import { Papel } from '../../domain/Papel';

export class RecomendadorDocumentario implements RecomendacaoStrategy {
    private readonly base = new SimilaridadeCosseno();

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        const resultado = this.base.recomendar(
            projeto,
            profissionais
        );

        const diretores = resultado.get(Papel.DIRETOR);

        if (diretores) {
            resultado.set(
                Papel.DIRETOR,
                [...diretores].sort((a, b) => {
                    const aTemEntrevista = a.possui('entrevista') ? 1 : 0;
                    const bTemEntrevista = b.possui('entrevista') ? 1 : 0;

                    return bTemEntrevista - aTemEntrevista;
                })
            );
        }

        return resultado;
    }
}