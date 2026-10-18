import { FabricaProjeto } from '../FabricaProjeto';
import { Projeto, PapelExigido } from '../../domain/Projeto';
import { ProjetoAnimacao } from '../../domain/ProjetoAnimacao';
import { VisitanteProjeto } from '../../visitors/VisitanteProjeto';
import { RecomendacaoStrategy } from '../../strategies/RecomendacaoStrategy';
import { Observador } from '../../observers/Observador';
import { ValidadorAnimacao } from './ValidadorAnimacao';
import { RecomendadorAnimacao } from './RecomendadorAnimacao';
import { NotificadorAnimacao } from './NotificadorAnimacao';

export interface DadosProjetoAnimacao {
    id: string;
    genero: string;
    duracao: number;
    orcamento: number;
    prazo: Date;
    papeisExigidos: PapelExigido[];
    motorGrafico: string;
    resolucaoEntrega: string;
}

export class FabricaAnimacao implements FabricaProjeto {
    criarProjeto(dados: DadosProjetoAnimacao): Projeto {
        return new ProjetoAnimacao(
            dados.id,
            dados.genero,
            dados.duracao,
            dados.orcamento,
            dados.prazo,
            dados.papeisExigidos,
            dados.motorGrafico,
            dados.resolucaoEntrega
        );
    }

    criarValidador(): VisitanteProjeto<boolean> {
        return new ValidadorAnimacao();
    }

    criarRecomendador(): RecomendacaoStrategy {
        return new RecomendadorAnimacao();
    }

    criarNotificador(): Observador {
        return new NotificadorAnimacao();
    }
}