
import { Projeto } from '../../../src/domain/Projeto';
import { ProjetoDocumentario } from '../../../src/domain/ProjetoDocumentario';
import { Papel } from '../../../src/domain/Papel';
import { ProjetoAnimacao } from '../../../src/domain/ProjetoAnimacao';
import { ProjetoPublicitario } from '../../../src/domain/ProjetoPublicitario';
import { PacoteServico } from '../../../src/servicos/PacoteServico';
import { ServicoAtomico } from '../../../src/servicos/ServicoAtomico';

describe('Prototype: Projeto.clonar()', () => {
    it('clona um Projeto básico com valores independentes do original', () => {
        const original = new Projeto(
            'p1',
            'ficcao',
            60,
            10000,
            new Date('2035-01-01'),
            [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ]
        );

        const clone = original.clonar();

        expect(clone).not.toBe(original);
        expect(clone.id).toBe(original.id);

        expect(clone.prazo).not.toBe(original.prazo);

        expect(clone.prazo.getTime()).toBe(
            original.prazo.getTime()
        );

        (clone.servicoPrincipal as PacoteServico).adicionar(
            new ServicoAtomico('Edicao extra', 100, 5, Papel.EDITOR, 0.5)
        );

        expect(original.exige()).toHaveLength(1);

        expect(clone.exige()).toHaveLength(2);
    });

    it('clonar() de uma subclasse preserva o tipo concreto e os campos extras', () => {
        const original = new ProjetoDocumentario(
            'doc-1',
            'documentario',
            60,
            20000,
            new Date('2035-01-01'),
            [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ],
            'cultura nordestina',
            ['Maria', 'Joao']
        );

        const clone = original.clonar();

        expect(clone).toBeInstanceOf(ProjetoDocumentario);
        expect(clone.tema).toBe('cultura nordestina');

        clone.entrevistados.push('Pedro');

        expect(original.entrevistados).toHaveLength(2);
        expect(clone.entrevistados).toHaveLength(3);
    });

    it('um clone começa sem a equipe do original', () => {
        const original = new Projeto(
            'p2',
            'doc',
            60,
            5000,
            new Date('2035-01-01'),
            [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ]
        );

        expect(original.clonar().getEquipe()).toBeNull();
    });

    it('clonar() de ProjetoAnimacao preserva os campos especificos', () => {
        const original = new ProjetoAnimacao(
            'anim-1',
            'animacao',
            30,
            15000,
            new Date('2035-01-01'),
            [
                {
                    papel: Papel.DIRETOR,
                    peso: 1
                }
            ],
            'Blender',
            '4K'
        );

        const clone = original.clonar();

        expect(clone).toBeInstanceOf(ProjetoAnimacao);
        expect(clone).not.toBe(original);
        expect(clone.motorGrafico).toBe('Blender');
        expect(clone.resolucaoEntrega).toBe('4K');
    });

    it('clonar() de ProjetoPublicitario preserva os campos especificos e copia arrays de forma independente', () => {
        const original = new ProjetoPublicitario(
            'ads-1',
            'publicitario',
            1,
            8000,
            new Date('2035-01-01'),
            [
                {
                    papel: Papel.EDITOR,
                    peso: 1
                }
            ],
            'Marca X',
            ['instagram']
        );

        const clone = original.clonar();

        expect(clone).toBeInstanceOf(ProjetoPublicitario);
        expect(clone.cliente).toBe('Marca X');

        clone.plataformasDistribuicao.push('youtube');

        expect(original.plataformasDistribuicao).toHaveLength(1);
        expect(clone.plataformasDistribuicao).toHaveLength(2);
    });
});
