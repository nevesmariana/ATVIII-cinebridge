import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    await prisma.convite.deleteMany();
    await prisma.avaliacao.deleteMany();
    await prisma.competencia.deleteMany();
    await prisma.profissional.deleteMany();

    const dados = [
        {
            id: 'p1',
            nome: 'Ana Silva',
            precoMedio: 6000,
            competencias: [
                { nome: 'direcao', nivel: 9 },
                { nome: 'lideranca', nivel: 8 },
                { nome: 'narrativa', nivel: 7 }
            ]
        },
        {
            id: 'p2',
            nome: 'Bruno Costa',
            precoMedio: 3500,
            competencias: [
                { nome: 'edicao', nivel: 8 },
                { nome: 'montagem', nivel: 9 },
                { nome: 'pos-producao', nivel: 7 }
            ]
        },
        {
            id: 'p3',
            nome: 'Carla Dias',
            precoMedio: 2800,
            competencias: [
                { nome: 'som', nivel: 8 },
                { nome: 'mixagem', nivel: 7 },
                { nome: 'audio', nivel: 8 }
            ]
        },
        {
            id: 'p4',
            nome: 'Diego Alves',
            precoMedio: 2000,
            competencias: [
                { nome: 'direcao', nivel: 5 },
                { nome: 'lideranca', nivel: 4 },
                { nome: 'narrativa', nivel: 6 }
            ]
        },
        {
            id: 'p5',
            nome: 'Elisa Rocha',
            precoMedio: 4500,
            competencias: [
                { nome: 'fotografia', nivel: 9 },
                { nome: 'iluminacao', nivel: 8 },
                { nome: 'enquadramento', nivel: 9 }
            ]
        },
        {
            id: 'p6',
            nome: 'Felipe Nunes',
            precoMedio: 3000,
            competencias: [
                { nome: 'roteiro', nivel: 8 },
                { nome: 'narrativa', nivel: 9 },
                { nome: 'dialogo', nivel: 7 }
            ]
        }
    ];

    for (const p of dados) {
        await prisma.profissional.create({
            data: {
                id: p.id,
                nome: p.nome,
                precoMedio: p.precoMedio,
                disponibilidadeInicio: new Date('2026-01-01'),
                disponibilidadeFim: new Date('2100-12-31'),
                competencias: {
                    create: p.competencias
                }
            }
        });
    }

    console.log(
        'Seed concluido:',
        dados.length,
        'profissionais inseridos.'
    );
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });