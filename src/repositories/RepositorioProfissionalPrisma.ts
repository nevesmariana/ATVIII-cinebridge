import { PrismaClient } from '../generated/prisma';

import { RepositorioProfissional } from './RepositorioProfissional';

import { Profissional } from '../domain/Profissional';
import { Competencia } from '../domain/Competencia';
import { Avaliacao } from '../domain/Avaliacao';
import { Intervalo } from '../domain/Intervalo';

type ProfissionalComRelacoes =
    Awaited<
        ReturnType<
            PrismaClient['profissional']['findFirstOrThrow']
        >
    > & {
        competencias: {
            nome: string;
            nivel: number;
        }[];

        avaliacoes: {
            nota: number;
            comentario: string;
            data: Date;
        }[];
    };

export class RepositorioProfissionalPrisma
    implements RepositorioProfissional {

    constructor(
        private readonly prisma: PrismaClient
    ) { }

    async listarTodos(): Promise<Profissional[]> {
        const registros =
            await this.prisma.profissional.findMany({
                include: {
                    competencias: true,
                    avaliacoes: true
                }
            });

        return registros.map(
            (r) =>
                this.paraDominio(
                    r as ProfissionalComRelacoes
                )
        );
    }

    async buscarPorId(
        id: string
    ): Promise<Profissional | undefined> {
        const registro =
            await this.prisma.profissional.findUnique({
                where: {
                    id
                },
                include: {
                    competencias: true,
                    avaliacoes: true
                }
            });

        return registro
            ? this.paraDominio(
                registro as ProfissionalComRelacoes
            )
            : undefined;
    }

    // Mapeia o formato "cru" do banco para uma instancia
    // de verdade da nossa classe de dominio
    private paraDominio(
        registro: ProfissionalComRelacoes
    ): Profissional {

        const competencias =
            registro.competencias.map(
                (c) =>
                    new Competencia(
                        c.nome,
                        c.nivel
                    )
            );

        const intervalo =
            new Intervalo(
                registro.disponibilidadeInicio,
                registro.disponibilidadeFim
            );

        const profissional =
            new Profissional(
                registro.id,
                registro.nome,
                competencias,
                intervalo,
                registro.precoMedio
            );

        for (const a of registro.avaliacoes) {
            profissional.recebe(
                new Avaliacao(
                    a.nota,
                    a.comentario,
                    a.data
                )
            );
        }

        return profissional;
    }
}