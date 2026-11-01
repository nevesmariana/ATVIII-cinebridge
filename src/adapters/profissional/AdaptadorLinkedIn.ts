import { AdaptadorProfissional } from './AdaptadorProfissional';
import { LinkedInSimulado, PerfilLinkedIn } from '../../externos/LinkedInSimulado';
import { Profissional } from '../../domain/Profissional';
import { Competencia } from '../../domain/Competencia';
import { Intervalo } from '../../domain/Intervalo';

export class AdaptadorLinkedIn implements AdaptadorProfissional {
    constructor(private readonly cliente: LinkedInSimulado) { }

    listarProfissionais(criterios: any): Profissional[] {
        return this.cliente
            .searchPeople(criterios?.competencia)
            .map((p) => this.converter(p));
    }

    detalharProfissional(id: string): Profissional {
        const perfil = this.cliente.getProfile(id);
        if (!perfil) {
            throw new Error(`Profissional '${id}' nao encontrado no LinkedIn`);
        }
        return this.converter(perfil);
    }

    registrarAvaliacao(id: string, avaliacao: any): void {
        this.cliente.postRecommendation(
            id,
            Math.round(avaliacao.nota / 2),
            avaliacao.comentario ?? ''
        );
    }

    private converter(p: PerfilLinkedIn): Profissional {
        return new Profissional(
            p.urn,
            p.fullName,
            p.skills.map(
                (s) =>
                    new Competencia(s.name, Math.min(10, Math.ceil(s.endorsements / 5)))
            ),
            new Intervalo(new Date('2026-01-01'), new Date('2100-12-31')),
            p.hourlyRate * 160
        );
    }
}