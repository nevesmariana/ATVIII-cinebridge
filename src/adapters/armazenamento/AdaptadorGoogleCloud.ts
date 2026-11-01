import { randomUUID } from 'crypto';
import { AdaptadorArmazenamento } from './AdaptadorArmazenamento';
import { GoogleCloudStorageSimulado } from '../../externos/GoogleCloudStorageSimulado';

export class AdaptadorGoogleCloud implements AdaptadorArmazenamento {
    constructor(private readonly cliente: GoogleCloudStorageSimulado) { }

    salvarArquivo(conteudo: Buffer, metadados: any): string {
        const pasta = metadados?.pasta ?? 'geral';
        const id = `${pasta}/${randomUUID()}`;
        const metadata: Record<string, string> = {};
        for (const [k, v] of Object.entries(metadados ?? {})) {
            metadata[k] = String(v);
        }
        this.cliente.file(id).save(conteudo, { metadata });
        return id;
    }

    recuperarArquivo(id: string): Buffer {
        const [dados] = this.cliente.file(id).download();
        return dados;
    }

    listarArquivos(prefixo: string): string[] {
        const [arquivos] = this.cliente.getFiles({ prefix: prefixo });
        return arquivos.map((a) => a.name);
    }
}