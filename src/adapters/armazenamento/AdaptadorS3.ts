import { randomUUID } from 'crypto';
import { AdaptadorArmazenamento } from './AdaptadorArmazenamento';
import { S3Simulado } from '../../externos/S3Simulado';

export class AdaptadorS3 implements AdaptadorArmazenamento {
    constructor(private readonly cliente: S3Simulado) { }

    salvarArquivo(conteudo: Buffer, metadados: any): string {
        const pasta = metadados?.pasta ?? 'geral';
        const id = `${pasta}/${randomUUID()}`;
        this.cliente.putObject(id, conteudo, this.paraTexto(metadados));
        return id;
    }

    recuperarArquivo(id: string): Buffer {
        return this.cliente.getObject(id).Body;
    }

    listarArquivos(prefixo: string): string[] {
        return this.cliente
            .listObjectsV2(prefixo)
            .Contents.map((c) => c.Key);
    }

    private paraTexto(metadados: any): Record<string, string> {
        const saida: Record<string, string> = {};
        for (const [k, v] of Object.entries(metadados ?? {})) {
            saida[k] = String(v);
        }
        return saida;
    }
}