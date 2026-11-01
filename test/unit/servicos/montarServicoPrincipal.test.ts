import { Papel } from '../../../src/domain/Papel';
import { montarServicoPrincipal } from '../../../src/servicos/montarServicoPrincipal';

describe('montarServicoPrincipal (lista de papeis -> arvore)', () => {
    const papeis = [
        { papel: Papel.DIRETOR, peso: 3 },
        { papel: Papel.EDITOR, peso: 1 }
    ];

    it('divide o orcamento proporcionalmente ao peso', () => {
        const servico = montarServicoPrincipal(papeis, 40000);
        const [diretor, editor] = servico.listarSubservicos();
        expect(diretor.calcularCusto()).toBeCloseTo(30000);
        expect(editor.calcularCusto()).toBeCloseTo(10000);
        expect(servico.calcularCusto()).toBeCloseTo(40000);
    });

    it('preserva papeis e pesos', () => {
        expect(montarServicoPrincipal(papeis, 1000).listarPapeis()).toEqual(papeis);
    });

    it('gera uma arvore valida', () => {
        expect(montarServicoPrincipal(papeis, 1000).validar()).toBe(true);
    });

    it('lista vazia gera pacote vazio com custo zero (e invalido)', () => {
        const servico = montarServicoPrincipal([], 1000);
        expect(servico.calcularCusto()).toBe(0);
        expect(servico.validar()).toBe(false);
    });
});