import { Profissional } from '../domain/Profissional';

export interface RepositorioProfissional {
    listarTodos(): Promise<Profissional[]>;

    buscarPorId(
        id: string
    ): Promise<Profissional | undefined>;
}