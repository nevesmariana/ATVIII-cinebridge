import { FabricaProjeto } from '../FabricaProjeto';
import { Projeto, PapelExigido } from '../../domain/Projeto';
import { ProjetoDocumentario } from '../../domain/ProjetoDocumentario';
import { VisitanteProjeto } from '../../visitors/VisitanteProjeto';
import { RecomendacaoStrategy } from '../../strategies/RecomendacaoStrategy';
import { Observador } from '../../observers/Observador';
import { ValidadorDocumentario } from './ValidadorDocumentario';
import { RecomendadorDocumentario } from './RecomendadorDocumentario';
import { NotificadorDocumentario } from './NotificadorDocumentario';

export interface DadosProjetoDocumentario {
    id: string;
    genero: string;
    duracao: number;
    orcamento: number;
    prazo: Date;
    papeisExigidos: PapelExigido[];
    tema: string;
    entrevistados: string[];
}

export class FabricaDocumentario implements FabricaProjeto {
    criarProjeto(dados: DadosProjetoDocumentario): Projeto {
        return new ProjetoDocumentario(
            dados.id,
            dados.genero,
            dados.duracao,
            dados.orcamento,
            dados.prazo,
            dados.papeisExigidos,
            dados.tema,
            dados.entrevistados
        );
    }

    criarValidador(): VisitanteProjeto<boolean> {
        return new ValidadorDocumentario();
    }

    criarRecomendador(): RecomendacaoStrategy {
        return new RecomendadorDocumentario();
    }

    criarNotificador(): Observador {
        return new NotificadorDocumentario();
    }
}