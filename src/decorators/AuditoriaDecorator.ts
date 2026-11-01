import { performance } from 'perf_hooks';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { RecomendacaoDecorator } from './RecomendacaoDecorator';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

export interface EntradaAuditoria {
    momento: Date;
    projetoId: string;
    candidatos: number;
    duracaoMs: number;
    papeisRecomendados: number;
    sucesso: boolean;
    erro?: string;
}

export interface RegistradorAuditoria {
    registrar(entrada: EntradaAuditoria): void;
}

export class RegistradorAuditoriaMemoria implements RegistradorAuditoria {
    readonly entradas: EntradaAuditoria[] = [];

    registrar(entrada: EntradaAuditoria): void {
        this.entradas.push(entrada);
    }
}

export class RegistradorAuditoriaConsole implements RegistradorAuditoria {
    registrar(entrada: EntradaAuditoria): void {
        const estado = entrada.sucesso ? 'OK' : `ERRO: ${entrada.erro}`;
        console.log(
            `[AUDITORIA] projeto=${entrada.projetoId} ` +
            `candidatos=${entrada.candidatos} ` +
            `duracao=${entrada.duracaoMs.toFixed(2)}ms ${estado}`
        );
    }
}

export class AuditoriaDecorator extends RecomendacaoDecorator {
    constructor(
        interno: RecomendacaoStrategy,
        private readonly registrador: RegistradorAuditoria
    ) {
        super(interno);
    }

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        const inicio = performance.now();
        const momento = new Date();

        try {
            const resultado = super.recomendar(projeto, profissionais);
            this.registrador.registrar({
                momento,
                projetoId: projeto.id,
                candidatos: profissionais.length,
                duracaoMs: performance.now() - inicio,
                papeisRecomendados: resultado.size,
                sucesso: true
            });
            return resultado;
        } catch (erro) {
            this.registrador.registrar({
                momento,
                projetoId: projeto.id,
                candidatos: profissionais.length,
                duracaoMs: performance.now() - inicio,
                papeisRecomendados: 0,
                sucesso: false,
                erro: erro instanceof Error ? erro.message : String(erro)
            });
            throw erro;
        }
    }
}