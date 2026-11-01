import { Projeto } from '../../../src/domain/Projeto';
import { ProjetoDocumentario } from '../../../src/domain/ProjetoDocumentario';
import { Papel } from '../../../src/domain/Papel';
import { PacoteServico } from '../../../src/servicos/PacoteServico';
import { ServicoAtomico } from '../../../src/servicos/ServicoAtomico';

function montarArvore(): PacoteServico {
    return new PacoteServico('Projeto completo')
        .adicionar(
            new PacoteServico('Pos-producao')
                .adicionar(new ServicoAtomico('Edicao', 5000, 10, Papel.EDITOR, 2))
                .adicionar(
                    new PacoteServico('Audio').adicionar(
                        new ServicoAtomico('Mixagem', 3000, 5, Papel.SONOPLASTA, 1)
                    )
                )
        )
        .adicionar(new ServicoAtomico('Direcao', 12000, 30, Papel.DIRETOR, 3));
}

const prazo = new Date('2035-01-01');

describe('Projeto com servicoPrincipal (Composite)', () => {
    it('calcularCustoTotal delega ao servico principal e soma a arvore toda', () => {
        const projeto = new Projeto('p1', 'ficcao', 90, 20000, prazo, montarArvore());
        expect(projeto.calcularCustoTotal()).toBe(5000 + 3000 + 12000);
    });

    it('exige() deriva os papeis (e pesos) da arvore', () => {
        const projeto = new Projeto('p1', 'ficcao', 90, 20000, prazo, montarArvore());
        expect(projeto.exige()).toEqual([
            { papel: Papel.EDITOR, peso: 2 },
            { papel: Papel.SONOPLASTA, peso: 1 },
            { papel: Papel.DIRETOR, peso: 3 }
        ]);
    });

    it('papel repetido em varios servicos tem os pesos somados', () => {
        const arvore = new PacoteServico('P')
            .adicionar(new ServicoAtomico('Edicao A', 100, 1, Papel.EDITOR, 2))
            .adicionar(new ServicoAtomico('Edicao B', 100, 1, Papel.EDITOR, 1));
        const projeto = new Projeto('p1', 'ficcao', 90, 200, prazo, arvore);
        expect(projeto.exige()).toEqual([{ papel: Papel.EDITOR, peso: 3 }]);
    });

    it('validarEstrutura e recursiva: servico invalido no fundo invalida o projeto', () => {
        const valido = new Projeto('p1', 'ficcao', 90, 20000, prazo, montarArvore());
        expect(valido.validarEstrutura()).toBe(true);

        const arvoreRuim = new PacoteServico('Raiz').adicionar(
            new PacoteServico('Meio').adicionar(
                new ServicoAtomico('Ruim', 100, 0, Papel.EDITOR)
            )
        );
        const invalido = new Projeto('p2', 'ficcao', 90, 100, prazo, arvoreRuim);
        expect(invalido.validarEstrutura()).toBe(false);
    });
});

describe('Projeto criado com a lista simples de papeis (formato antigo)', () => {
    const papeis = [
        { papel: Papel.DIRETOR, peso: 3 },
        { papel: Papel.EDITOR, peso: 1 }
    ];

    it('tambem passa a ter servicoPrincipal, com custo igual ao orcamento', () => {
        const projeto = new Projeto('p1', 'ficcao', 90, 40000, prazo, papeis);
        expect(projeto.servicoPrincipal).toBeDefined();
        expect(projeto.calcularCustoTotal()).toBeCloseTo(40000);
        expect(projeto.validarEstrutura()).toBe(true);
    });

    it('exige() continua devolvendo os mesmos papeis de antes', () => {
        const projeto = new Projeto('p1', 'ficcao', 90, 40000, prazo, papeis);
        expect(projeto.exige()).toEqual(papeis);
    });
});

describe('Projeto.clonar() com arvore (copia profunda)', () => {
    it('alterar a arvore do clone nao altera o original', () => {
        const original = new Projeto('p1', 'ficcao', 90, 20000, prazo, montarArvore());
        const clone = original.clonar();

        expect(clone.servicoPrincipal).not.toBe(original.servicoPrincipal);
        expect(clone.calcularCustoTotal()).toBe(original.calcularCustoTotal());

        (clone.servicoPrincipal as PacoteServico).adicionar(
            new ServicoAtomico('Extra', 1000, 2, Papel.EDITOR)
        );

        expect(clone.calcularCustoTotal()).toBe(21000);
        expect(original.calcularCustoTotal()).toBe(20000);
    });

    it('subclasse tambem clona a arvore e preserva os campos extras', () => {
        const original = new ProjetoDocumentario(
            'd1', 'documentario', 60, 20000, prazo, montarArvore(),
            'cultura', ['Maria']
        );
        const clone = original.clonar();

        expect(clone).toBeInstanceOf(ProjetoDocumentario);
        expect(clone.tema).toBe('cultura');
        expect(clone.servicoPrincipal).not.toBe(original.servicoPrincipal);
        expect(clone.calcularCustoTotal()).toBe(20000);
    });
});