export interface PerfilLinkedIn {
    urn: string;
    fullName: string;
    skills: { name: string; endorsements: number }[];
    hourlyRate: number;
}

export class LinkedInSimulado {
    readonly recomendacoesRecebidas: {
        urn: string;
        stars: number;
        text: string;
    }[] = [];

    private readonly perfis: PerfilLinkedIn[] = [
        {
            urn: 'li-100',
            fullName: 'Marina Torres',
            skills: [
                { name: 'direcao', endorsements: 48 },
                { name: 'lideranca', endorsements: 30 },
                { name: 'narrativa', endorsements: 25 }
            ],
            hourlyRate: 40
        },
        {
            urn: 'li-101',
            fullName: 'Rafael Moura',
            skills: [
                { name: 'edicao', endorsements: 42 },
                { name: 'montagem', endorsements: 35 },
                { name: 'pos-producao', endorsements: 20 }
            ],
            hourlyRate: 25
        }
    ];

    searchPeople(keyword?: string): PerfilLinkedIn[] {
        if (!keyword) {
            return [...this.perfis];
        }
        return this.perfis.filter((p) =>
            p.skills.some((s) => s.name === keyword)
        );
    }

    getProfile(urn: string): PerfilLinkedIn | undefined {
        return this.perfis.find((p) => p.urn === urn);
    }

    postRecommendation(urn: string, stars: number, text: string): void {
        this.recomendacoesRecebidas.push({ urn, stars, text });
    }
}