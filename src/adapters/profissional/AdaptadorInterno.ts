import { AdaptadorProfissional } from './AdaptadorProfissional';
import { CadastroInternoSimulado, RegistroInterno } from '../../externos/CadastroInternoSimulado';
import { Profissional } from '../../domain/Profissional';
import { Competencia } from '../../domain/Competencia';
import { Intervalo } from '../../domain/Intervalo';

export class AdaptadorInterno implements AdaptadorProfissional {
    constructor(private readonly cadastro: CadastroInternoSimulado) { }

    listarProfissionais(criterios: any): Profissional[] {
        return this.cadastro
            .consultar(criterios?.competencia)
            .map((r) => this.converter(r));
    }

    detalharProfissional(id: string): Profissional {
        const registro = this.cadastro.buscarPorCodigo(id);
        if (!registro) {
            throw new Error(`Profissional '${id}' nao encontrado no cadastro interno`);
        }
        return this.converter(registro);
    }

    registrarAvaliacao(id: string, avaliacao: any): void {
        this.cadastro.gravarNota(id, avaliacao.nota);
    }

    private converter(r: RegistroInterno): Profissional {
        const competencias = r.habilidades.split(';').map((par) => {
            const [nome, nivel] = par.split(':');
            return new Competencia(nome, Number(nivel));
        });
        return new Profissional(
            r.codigo,
            r.nome,
            competencias,
            new Intervalo(new Date(r.disponivelDe), new Date(r.disponivelAte)),
            r.valorMensal
        );
    }
}