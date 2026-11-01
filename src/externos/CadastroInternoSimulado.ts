export interface RegistroInterno {
    codigo: string;
    nome: string;
    habilidades: string;
    valorMensal: number;
    disponivelDe: string;
    disponivelAte: string;
}

export class CadastroInternoSimulado {
    readonly notasGravadas: { codigo: string; nota: number }[] = [];

    private readonly registros: RegistroInterno[] = [
        {
            codigo: 'int-1',
            nome: 'Paula Ferraz',
            habilidades: 'som:9;mixagem:8;audio:9',
            valorMensal: 3200,
            disponivelDe: '2026-01-01',
            disponivelAte: '2100-12-31'
        },
        {
            codigo: 'int-2',
            nome: 'Tiago Lima',
            habilidades: 'fotografia:8;iluminacao:7;enquadramento:8',
            valorMensal: 4100,
            disponivelDe: '2026-01-01',
            disponivelAte: '2100-12-31'
        }
    ];

    consultar(habilidade?: string): RegistroInterno[] {
        if (!habilidade) {
            return [...this.registros];
        }
        return this.registros.filter((r) =>
            r.habilidades.split(';').some((h) => h.startsWith(`${habilidade}:`))
        );
    }

    buscarPorCodigo(codigo: string): RegistroInterno | undefined {
        return this.registros.find((r) => r.codigo === codigo);
    }

    gravarNota(codigo: string, nota: number): void {
        this.notasGravadas.push({ codigo, nota });
    }
}