import { Papel } from './domain/Papel';
import { Projeto } from './domain/Projeto';
import { RepositorioProfissionalMemoria } from './repositories/RepositorioProfissionalMemoria';
import { OrquestradorPadrao } from './orchestration/OrquestradorPadrao';
import { SimilaridadeCosseno } from './strategies/SimilaridadeCosseno';
import { RegrasOrcamento } from './strategies/RegrasOrcamento';
import { SistemaRecomendacao } from './observers/SistemaRecomendacao';
import { NotificadorEmail } from './observers/NotificadorEmail';
import { NotificadorInterno } from './observers/NotificadorInterno';
import { AuditoriaRecomendacao } from './observers/AuditoriaRecomendacao';
import { GeradorRelatorio } from './visitors/GeradorRelatorio';
import { ValidadorConsistencia } from './visitors/ValidadorConsistencia';
import { CalculadorCompatibilidade } from './visitors/CalculadorCompatibilidade';

async function main(): Promise<void> {
    const repositorio =
        new RepositorioProfissionalMemoria();

    const orquestrador =
        new OrquestradorPadrao(repositorio);

    const sistema =
        new SistemaRecomendacao(
            orquestrador,
            new SimilaridadeCosseno()
        );

    const auditoria =
        new AuditoriaRecomendacao();

    sistema.adicionarObservador(
        new NotificadorEmail()
    );

    sistema.adicionarObservador(
        new NotificadorInterno()
    );

    sistema.adicionarObservador(
        auditoria
    );

    const projeto = new Projeto(
        'proj-1',
        'documentario',
        90,
        30000,
        new Date('2035-01-01'),
        [
            {
                papel: Papel.DIRETOR,
                peso: 1
            },
            {
                papel: Papel.EDITOR,
                peso: 0.8
            },
            {
                papel: Papel.SONOPLASTA,
                peso: 0.6
            }
        ]
    );

    console.log(
        '=== Recomendacao com Strategy: SimilaridadeCosseno ==='
    );

    await sistema.executarRecomendacao(
        projeto
    );

    console.log(
        '\n=== Trocando a estrategia para RegrasOrcamento e reavaliando ==='
    );

    sistema.definirEstrategia(
        new RegrasOrcamento()
    );

    projeto.solicitarReavaliacao();

    await sistema.executarRecomendacao(
        projeto
    );

    console.log(
        '\n=== Relatorio final (Visitor: GeradorRelatorio) ==='
    );

    console.log(
        projeto.aceitar(
            new GeradorRelatorio()
        )
    );

    console.log(
        '\n=== Validacao de consistencia (Visitor: ValidadorConsistencia) ==='
    );

    console.log(
        'Projeto consistente?',
        projeto.aceitar(
            new ValidadorConsistencia()
        )
    );

    console.log(
        '\n=== Compatibilidade da equipe (Visitor: CalculadorCompatibilidade) ==='
    );

    console.log(
        'Nota de compatibilidade:',
        projeto.aceitar(
            new CalculadorCompatibilidade()
        )
    );

    console.log(
        '\n=== Logs de auditoria registrados ==='
    );

    console.log(
        auditoria.obterLogs()
    );
}

main();