import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

// Estratégia baseada no histórico de avaliações recebidas pelos profissionais
export class FiltragemColaborativa implements RecomendacaoStrategy {
    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        const resultado = new Map<Papel, Profissional[]>();

        for (const exigencia of projeto.exige()) {
            const ranking = [...profissionais]
                .filter((p) => p.mediaAvaliacoes() > 0)
                .sort(
                    (a, b) =>
                        b.mediaAvaliacoes() -
                        a.mediaAvaliacoes()
                );

            resultado.set(exigencia.papel, ranking);
        }

        return resultado;
    }
}