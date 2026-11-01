import { Papel } from '../../../src/domain/Papel';
import { ServicoAtomico } from '../../../src/servicos/ServicoAtomico';
import { PacoteServico } from '../../../src/servicos/PacoteServico';

const edicao = () => new ServicoAtomico('Edicao de video', 5000, 10, Papel.EDITOR);
const mixagem = () => new ServicoAtomico('Mixagem de audio', 3000, 5, Papel.SONOPLASTA);
const coloracao = () => new ServicoAtomico('Coloracao', 2000, 4, Papel.DIRETOR_FOTOGRAFIA);
const vfx = () => new ServicoAtomico('Efeitos visuais', 8000, 15, Papel.EFEITOS_VISUAIS);

describe('Composite: ServicoAtomico (folha)', () => {
    it('devolve seu proprio custo e prazo e nao tem filhos', () => {
        const s = edicao();
        expect(s.calcularCusto()).toBe(5000);
        expect(s.obterPrazo()).toBe(10);
        expect(s.listarSubservicos()).toEqual([]);
        expect(s.validar()).toBe(true);
    });

    it.each([
        ['nome vazio', new ServicoAtomico('  ', 100, 1, Papel.EDITOR)],
        ['custo negativo', new ServicoAtomico('x', -1, 1, Papel.EDITOR)],
        ['prazo zero', new ServicoAtomico('x', 100, 0, Papel.EDITOR)],
        ['papel invalido', new ServicoAtomico('x', 100, 1, 'INEXISTENTE' as Papel)]
    ])('e invalido com %s', (_motivo, servico) => {
        expect(servico.validar()).toBe(false);
    });
});

describe('Composite: PacoteServico em varias profundidades', () => {
    it('profundidade 1: pacote com folhas', () => {
        const pacote = new PacoteServico('Pos-producao')
            .adicionar(edicao())
            .adicionar(mixagem());

        expect(pacote.calcularCusto()).toBe(8000);
        expect(pacote.obterPrazo()).toBe(15);
        expect(pacote.listarSubservicos()).toHaveLength(2);
        expect(pacote.validar()).toBe(true);
    });

    it('profundidade 2: pacote dentro de pacote', () => {
        const audio = new PacoteServico('Audio').adicionar(mixagem());
        const pos = new PacoteServico('Pos-producao')
            .adicionar(edicao())
            .adicionar(audio);

        expect(pos.calcularCusto()).toBe(8000);
        expect(pos.obterPrazo()).toBe(15);
    });

    it('profundidade 3: o calculo e recursivo ate o fim', () => {
        const visual = new PacoteServico('Visual').adicionar(coloracao()).adicionar(vfx());
        const imagem = new PacoteServico('Imagem').adicionar(visual);
        const pos = new PacoteServico('Pos-producao')
            .adicionar(imagem)
            .adicionar(edicao())
            .adicionar(new PacoteServico('Audio').adicionar(mixagem()));

        expect(pos.calcularCusto()).toBe(2000 + 8000 + 5000 + 3000);
        expect(pos.obterPrazo()).toBe(4 + 15 + 10 + 5);
        expect(pos.validar()).toBe(true);
    });

    it('um pacote pode ser filho de varios pacotes personalizados', () => {
        const audio = new PacoteServico('Audio').adicionar(mixagem());
        const a = new PacoteServico('Pacote A').adicionar(audio);
        const b = new PacoteServico('Pacote B').adicionar(audio).adicionar(edicao());
        expect(a.calcularCusto()).toBe(3000);
        expect(b.calcularCusto()).toBe(8000);
    });
});

describe('Composite: validacao recursiva', () => {
    it('um servico invalido no fundo da arvore invalida tudo', () => {
        const ruim = new ServicoAtomico('Ruim', 100, 0, Papel.EDITOR);
        const raiz = new PacoteServico('Raiz').adicionar(
            new PacoteServico('Meio').adicionar(
                new PacoteServico('Fundo').adicionar(ruim)
            )
        );
        expect(raiz.validar()).toBe(false);
    });

    it('pacote vazio ou sem nome e invalido', () => {
        expect(new PacoteServico('Vazio').validar()).toBe(false);
        expect(new PacoteServico('').adicionar(edicao()).validar()).toBe(false);
    });
});

describe('Composite: manutencao da arvore', () => {
    it('remover tira o servico e recalcula o custo', () => {
        const e = edicao();
        const pacote = new PacoteServico('P').adicionar(e).adicionar(mixagem());
        expect(pacote.remover(e)).toBe(true);
        expect(pacote.calcularCusto()).toBe(3000);
        expect(pacote.remover(e)).toBe(false);
    });

    it('listarSubservicos devolve copia (nao expoe a lista interna)', () => {
        const pacote = new PacoteServico('P').adicionar(edicao());
        pacote.listarSubservicos().pop();
        expect(pacote.listarSubservicos()).toHaveLength(1);
    });

    it('impede ciclos', () => {
        const a = new PacoteServico('A');
        const b = new PacoteServico('B');
        a.adicionar(b);
        expect(() => a.adicionar(a)).toThrow('Ciclo');
        expect(() => b.adicionar(a)).toThrow('Ciclo');
    });
});


describe('Composite: papeis e peso', () => {
    it('folha: peso padrao 1 e devolve seu papel', () => {
        expect(edicao().peso).toBe(1);
        expect(edicao().listarPapeis()).toEqual([{ papel: Papel.EDITOR, peso: 1 }]);
    });

    it('peso precisa ser positivo', () => {
        expect(new ServicoAtomico('x', 100, 1, Papel.EDITOR, 0).validar()).toBe(false);
    });

    it('pacote junta os papeis de toda a arvore', () => {
        const pos = new PacoteServico('Pos')
            .adicionar(new PacoteServico('Audio').adicionar(mixagem()))
            .adicionar(new ServicoAtomico('Edicao', 100, 1, Papel.EDITOR, 3));
        expect(pos.listarPapeis()).toEqual([
            { papel: Papel.SONOPLASTA, peso: 1 },
            { papel: Papel.EDITOR, peso: 3 }
        ]);
    });
});


describe('Composite: clonar (copia profunda)', () => {
    it('folha clonada e independente e igual em valores', () => {
        const original = edicao();
        const copia = original.clonar();
        expect(copia).not.toBe(original);
        expect(copia.calcularCusto()).toBe(original.calcularCusto());
        expect(copia.listarPapeis()).toEqual(original.listarPapeis());
    });

    it('pacote clonado copia a arvore inteira, sem compartilhar filhos', () => {
        const original = new PacoteServico('Pos')
            .adicionar(edicao())
            .adicionar(new PacoteServico('Audio').adicionar(mixagem()));
        const copia = original.clonar();

        expect(copia).not.toBe(original);
        expect(copia.calcularCusto()).toBe(8000);

        copia.adicionar(vfx());
        expect(copia.calcularCusto()).toBe(16000);
        expect(original.calcularCusto()).toBe(8000);

        const filhoOriginal = original.listarSubservicos()[1];
        const filhoCopia = copia.listarSubservicos()[1];
        expect(filhoCopia).not.toBe(filhoOriginal);
    });
});