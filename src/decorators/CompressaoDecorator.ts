import { gzipSync, gunzipSync } from 'zlib';
import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { RecomendacaoDecorator } from './RecomendacaoDecorator';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

export interface PacoteComprimido {
    dados: Buffer;
    tamanhoOriginal: number;
    tamanhoComprimido: number;
}

export interface RecomendacaoSerializada {
    papel: string;
    profissionais: {
        id: string;
        nome: string;
        precoMedio: number;
        competencias: { nome: string; nivel: number }[];
    }[];
}

export class CompressaoDecorator extends RecomendacaoDecorator {
    private ultimo: PacoteComprimido | null = null;

    constructor(interno: RecomendacaoStrategy) {
        super(interno);
    }

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        const resultado = super.recomendar(projeto, profissionais);
        this.ultimo = CompressaoDecorator.comprimir(resultado);
        return resultado;
    }

    ultimoPacote(): PacoteComprimido | null {
        return this.ultimo;
    }

    static comprimir(
        resultado: Map<Papel, Profissional[]>
    ): PacoteComprimido {
        const serializavel: RecomendacaoSerializada[] = [...resultado].map(
            ([papel, lista]) => ({
                papel,
                profissionais: lista.map((p) => ({
                    id: p.id,
                    nome: p.nome,
                    precoMedio: p.precoMedio,
                    competencias: p.competencias.map((c) => ({
                        nome: c.nome,
                        nivel: c.nivel
                    }))
                }))
            })
        );
        const texto = Buffer.from(JSON.stringify(serializavel), 'utf-8');
        const dados = gzipSync(texto);
        return {
            dados,
            tamanhoOriginal: texto.length,
            tamanhoComprimido: dados.length
        };
    }

    static descomprimir(dados: Buffer): RecomendacaoSerializada[] {
        return JSON.parse(gunzipSync(dados).toString('utf-8'));
    }
}