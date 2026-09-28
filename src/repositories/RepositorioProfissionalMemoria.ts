import { Profissional } from '../domain/Profissional';
import { Competencia } from '../domain/Competencia';
import { Intervalo } from '../domain/Intervalo';
import { RepositorioProfissional } from './RepositorioProfissional';

export class RepositorioProfissionalMemoria
    implements RepositorioProfissional {

    private readonly profissionais: Profissional[] = [
        new Profissional(
            'p1',
            'Ana Silva',
            [
                new Competencia('direcao', 9),
                new Competencia('lideranca', 8),
                new Competencia('narrativa', 7)
            ],
            new Intervalo(
                new Date('2026-01-01'),
                new Date('2100-12-31')
            ),
            6000
        ),

        new Profissional(
            'p2',
            'Bruno Costa',
            [
                new Competencia('edicao', 8),
                new Competencia('montagem', 9),
                new Competencia('pos-producao', 7)
            ],
            new Intervalo(
                new Date('2026-01-01'),
                new Date('2100-12-31')
            ),
            3500
        ),

        new Profissional(
            'p3',
            'Carla Dias',
            [
                new Competencia('som', 8),
                new Competencia('mixagem', 7),
                new Competencia('audio', 8)
            ],
            new Intervalo(
                new Date('2026-01-01'),
                new Date('2100-12-31')
            ),
            2800
        ),

        new Profissional(
            'p4',
            'Diego Alves',
            [
                new Competencia('direcao', 5),
                new Competencia('lideranca', 4),
                new Competencia('narrativa', 6)
            ],
            new Intervalo(
                new Date('2026-01-01'),
                new Date('2100-12-31')
            ),
            2000
        ),

        new Profissional(
            'p5',
            'Elisa Rocha',
            [
                new Competencia('fotografia', 9),
                new Competencia('iluminacao', 8),
                new Competencia('enquadramento', 9)
            ],
            new Intervalo(
                new Date('2026-01-01'),
                new Date('2100-12-31')
            ),
            4500
        ),

        new Profissional(
            'p6',
            'Felipe Nunes',
            [
                new Competencia('roteiro', 8),
                new Competencia('narrativa', 9),
                new Competencia('dialogo', 7)
            ],
            new Intervalo(
                new Date('2026-01-01'),
                new Date('2100-12-31')
            ),
            3000
        )
    ];

    async listarTodos(): Promise<Profissional[]> {
        return this.profissionais;
    }

    async buscarPorId(
        id: string
    ): Promise<Profissional | undefined> {
        return this.profissionais.find(
            (p) => p.id === id
        );
    }
}