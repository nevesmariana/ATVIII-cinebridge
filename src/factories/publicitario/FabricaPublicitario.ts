import { FabricaProjeto } from '../FabricaProjeto';
import { Projeto, PapelExigido } from '../../domain/Projeto';
import { ProjetoPublicitario } from '../../domain/ProjetoPublicitario';
import { VisitanteProjeto } from '../../visitors/VisitanteProjeto';
import { RecomendacaoStrategy } from '../../strategies/RecomendacaoStrategy';
import { Observador } from '../../observers/Observador';
import { ValidadorPublicitario } from './ValidadorPublicitario';
import { RecomendadorPublicitario } from './RecomendadorPublicitario';
import { NotificadorPublicitario } from './NotificadorPublicitario';

export interface DadosProjetoPublicitario {
    id: string;
    genero: string;
    duracao: number;
    orcamento: number;
    prazo: Date;
    papeisExigidos: PapelExigido[];
    cliente: string;
    plataformasDistribuicao: string[];
}

export class FabricaPublicitario implements FabricaProjeto {
    criarProjeto(dados: DadosProjetoPublicitario): Projeto {
        return new ProjetoPublicitario(
            dados.id,
            dados.genero,
            dados.duracao,
            dados.orcamento,
            dados.prazo,
            dados.papeisExigidos,
            dados.cliente,
            dados.plataformasDistribuicao
        );
    }

    criarValidador(): VisitanteProjeto<boolean> {
        return new ValidadorPublicitario();
    }

    criarRecomendador(): RecomendacaoStrategy {
        return new RecomendadorPublicitario();
    }

    criarNotificador(): Observador {
        return new NotificadorPublicitario();
    }
}