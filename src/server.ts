import { PrismaClient } from './generated/prisma';

import { RepositorioProfissionalPrisma } from './repositories/RepositorioProfissionalPrisma';

import { buildApp } from './http/build';

const prisma = new PrismaClient();

const repositorio =
    new RepositorioProfissionalPrisma(
        prisma
    );

const app =
    buildApp(
        repositorio
    );

app.listen(
    {
        port: 3000
    },
    (err, address) => {

        if (err) {
            app.log.error(err);
            process.exit(1);
        }

        console.log(
            `Servidor rodando em ${address}`
        );
    }
);