import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

// Estratégia para projetos com orçamento reduzido:
// prioriza o menor preço médio
export class RegrasOrcamento implements RecomendacaoStrategy {

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {

        const resultado = new Map<Papel, Profissional[]>();

        const limitePorPapel =
            projeto.orcamento /
            Math.max(projeto.exige().length, 1);

        for (const exigencia of projeto.exige()) {

            const ranking = [...profissionais]
                .filter(
                    (p) => p.precoMedio <= limitePorPapel
                )
                .sort(
                    (a, b) =>
                        a.precoMedio - b.precoMedio
                );

            resultado.set(
                exigencia.papel,
                ranking
            );
        }

        return resultado;
    }
}