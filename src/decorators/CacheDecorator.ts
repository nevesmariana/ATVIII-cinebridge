import { RecomendacaoStrategy } from '../strategies/RecomendacaoStrategy';
import { RecomendacaoDecorator } from './RecomendacaoDecorator';
import { Papel } from '../domain/Papel';
import { Profissional } from '../domain/Profissional';
import { Projeto } from '../domain/Projeto';

interface EntradaCache {
    resultado: Map<Papel, Profissional[]>;
    expiraEm: number;
}

export class CacheDecorator extends RecomendacaoDecorator {
    private readonly entradas = new Map<string, EntradaCache>();
    private acertos = 0;
    private falhas = 0;

    constructor(
        interno: RecomendacaoStrategy,
        private readonly ttlMs: number = Infinity,
        private readonly relogio: () => number = () => Date.now()
    ) {
        super(interno);
    }

    recomendar(
        projeto: Projeto,
        profissionais: Profissional[]
    ): Map<Papel, Profissional[]> {
        const chave = this.gerarChave(projeto, profissionais);
        const agora = this.relogio();
        const existente = this.entradas.get(chave);

        if (existente && existente.expiraEm > agora) {
            this.acertos += 1;
            return this.copiar(existente.resultado);
        }

        this.falhas += 1;
        const resultado = super.recomendar(projeto, profissionais);
        this.entradas.set(chave, {
            resultado: this.copiar(resultado),
            expiraEm: agora + this.ttlMs
        });
        return resultado;
    }

    estatisticas(): { acertos: number; falhas: number; entradas: number } {
        return {
            acertos: this.acertos,
            falhas: this.falhas,
            entradas: this.entradas.size
        };
    }

    limpar(): void {
        this.entradas.clear();
    }

    private gerarChave(
        projeto: Projeto,
        profissionais: Profissional[]
    ): string {
        const papeis = projeto
            .exige()
            .map((e) => `${e.papel}:${e.peso}`)
            .sort()
            .join(',');

        const candidatos = profissionais
            .map((p) => {
                const competencias = p.competencias
                    .map((c) => `${c.nome}=${c.nivel}`)
                    .sort()
                    .join('+');
                return `${p.id}:${p.precoMedio}:${p.mediaAvaliacoes()}:${competencias}`;
            })
            .sort()
            .join('|');

        return `${projeto.genero}#${projeto.orcamento}#${papeis}#${candidatos}`;
    }

    private copiar(
        original: Map<Papel, Profissional[]>
    ): Map<Papel, Profissional[]> {
        const copia = new Map<Papel, Profissional[]>();
        for (const [papel, lista] of original) {
            copia.set(papel, [...lista]);
        }
        return copia;
    }
}