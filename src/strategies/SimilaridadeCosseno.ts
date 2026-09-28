import { RecomendacaoStrategy } from './RecomendacaoStrategy';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

// Skills de referência associadas a cada papel
// (base do vetor de comparação)
const COMPETENCIAS_POR_PAPEL: Record<Papel, string[]> = {
    [Papel.DIRETOR]: [
        'direcao',
        'lideranca',
        'narrativa'
    ],

    [Papel.DIRETOR_FOTOGRAFIA]: [
        'fotografia',
        'iluminacao',
        'enquadramento'
    ],

    [Papel.SONOPLASTA]: [
        'som',
        'mixagem',
        'audio'
    ],

    [Papel.EDITOR]: [
        'edicao',
        'montagem',
        'pos-producao'
    ],

    [Papel.ROTEIRISTA]: [
        'roteiro',
        'narrativa',
        'dialogo'
    ],

    [Papel.EFEITOS_VISUAIS]: [
        'efeitos-visuais',
        'animacao',
        'composicao'
    ]
};

export class SimilaridadeCosseno implements RecomendacaoStrategy {

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {

        const resultado = new Map<Papel, Profissional[]>();

        for (const exigencia of projeto.exige()) {

            const skills =
                COMPETENCIAS_POR_PAPEL[exigencia.papel];

            const ranking = profissionais
                .map((p) => ({
                    profissional: p,
                    score: this.similaridade(p, skills)
                }))
                .filter((r) => r.score > 0)
                .sort((a, b) => b.score - a.score)
                .map((r) => r.profissional);

            resultado.set(
                exigencia.papel,
                ranking
            );
        }

        return resultado;
    }

    private similaridade(
        profissional: Profissional,
        skills: string[]
    ): number {

        const vetorProfissional = skills.map(
            (s) => profissional.possui(s)?.nivel ?? 0
        );

        const vetorIdeal = skills.map(() => 10);

        // Nível máximo desejado em cada skill
        const produtoEscalar = vetorProfissional.reduce(
            (acc, v, i) => acc + v * vetorIdeal[i],
            0
        );

        const normaProfissional = Math.sqrt(
            vetorProfissional.reduce(
                (acc, v) => acc + v * v,
                0
            )
        );

        const normaIdeal = Math.sqrt(
            vetorIdeal.reduce(
                (acc, v) => acc + v * v,
                0
            )
        );

        if (
            normaProfissional === 0 ||
            normaIdeal === 0
        ) {
            return 0;
        }

        return (
            produtoEscalar /
            (normaProfissional * normaIdeal)
        );
    }
}