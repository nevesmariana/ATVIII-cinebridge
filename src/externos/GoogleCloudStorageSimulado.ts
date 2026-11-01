export class ArquivoGcs {
    constructor(
        private readonly deposito: Map<string, { data: Buffer; metadata: Record<string, string> }>,
        public readonly name: string
    ) { }

    save(data: Buffer, options: { metadata: Record<string, string> }): void {
        this.deposito.set(this.name, { data, metadata: options.metadata });
    }

    download(): [Buffer] {
        const item = this.deposito.get(this.name);
        if (!item) {
            throw new Error(`GCS 404 Not Found: ${this.name}`);
        }
        return [item.data];
    }
}

export class GoogleCloudStorageSimulado {
    private readonly deposito = new Map<
        string,
        { data: Buffer; metadata: Record<string, string> }
    >();

    file(name: string): ArquivoGcs {
        return new ArquivoGcs(this.deposito, name);
    }

    getFiles(options: { prefix: string }): [{ name: string }[]] {
        const arquivos = [...this.deposito.keys()]
            .filter((k) => k.startsWith(options.prefix))
            .map((name) => ({ name }));
        return [arquivos];
    }
}