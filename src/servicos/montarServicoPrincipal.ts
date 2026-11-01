import { PapelExigido } from '../domain/Projeto';
import { PacoteServico } from './PacoteServico';
import { ServicoAtomico } from './ServicoAtomico';
import { ServicoProjeto } from './ServicoProjeto';

export const PRAZO_PADRAO_DIAS = 30;

export function montarServicoPrincipal(
    papeis: PapelExigido[],
    orcamento: number
): ServicoProjeto {
    const somaPesos = papeis.reduce((total, p) => total + p.peso, 0);
    const pacote = new PacoteServico('Servicos do projeto');

    for (const exigido of papeis) {
        const custo = somaPesos > 0 ? (orcamento * exigido.peso) / somaPesos : 0;
        pacote.adicionar(
            new ServicoAtomico(
                `Servico de ${exigido.papel}`,
                custo,
                PRAZO_PADRAO_DIAS,
                exigido.papel,
                exigido.peso
            )
        );
    }
    return pacote;
}