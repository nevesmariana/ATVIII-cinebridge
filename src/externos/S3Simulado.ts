export interface ObjetoS3 {
    Key: string;
    Body: Buffer;
    Metadata: Record<string, string>;
}

export class S3Simulado {
    private readonly objetos = new Map<string, ObjetoS3>();

    constructor(public readonly bucket: string = 'cinebridge-midia') { }

    putObject(
        key: string,
        body: Buffer,
        metadata: Record<string, string>
    ): { ETag: string } {
        this.objetos.set(key, { Key: key, Body: body, Metadata: metadata });
        return { ETag: `etag-${key}` };
    }

    getObject(key: string): { Body: Buffer } {
        const objeto = this.objetos.get(key);
        if (!objeto) {
            throw new Error(`S3 NoSuchKey: ${key}`);
        }
        return { Body: objeto.Body };
    }

    listObjectsV2(prefix: string): { Contents: { Key: string }[] } {
        const contents = [...this.objetos.keys()]
            .filter((k) => k.startsWith(prefix))
            .map((Key) => ({ Key }));
        return { Contents: contents };
    }
}