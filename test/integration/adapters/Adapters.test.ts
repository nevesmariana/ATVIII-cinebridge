import { SistemaRecomendacao } from '../../../src/observers/SistemaRecomendacao';
import { OrquestradorPadrao } from '../../../src/orchestration/OrquestradorPadrao';
import { RepositorioProfissionalMemoria } from '../../../src/repositories/RepositorioProfissionalMemoria';
import { SimilaridadeCosseno } from '../../../src/strategies/SimilaridadeCosseno';

import { AdaptadorArmazenamento } from '../../../src/adapters/armazenamento/AdaptadorArmazenamento';
import { AdaptadorS3 } from '../../../src/adapters/armazenamento/AdaptadorS3';
import { AdaptadorGoogleCloud } from '../../../src/adapters/armazenamento/AdaptadorGoogleCloud';
import { AdaptadorPagamento } from '../../../src/adapters/pagamento/AdaptadorPagamento';
import { AdaptadorStripe } from '../../../src/adapters/pagamento/AdaptadorStripe';
import { AdaptadorPagSeguro } from '../../../src/adapters/pagamento/AdaptadorPagSeguro';
import { AdaptadorProfissional } from '../../../src/adapters/profissional/AdaptadorProfissional';
import { AdaptadorLinkedIn } from '../../../src/adapters/profissional/AdaptadorLinkedIn';
import { AdaptadorInterno } from '../../../src/adapters/profissional/AdaptadorInterno';

import { S3Simulado } from '../../../src/externos/S3Simulado';
import { GoogleCloudStorageSimulado } from '../../../src/externos/GoogleCloudStorageSimulado';
import { StripeSimulado } from '../../../src/externos/StripeSimulado';
import { PagSeguroSimulado } from '../../../src/externos/PagSeguroSimulado';
import { LinkedInSimulado } from '../../../src/externos/LinkedInSimulado';
import { CadastroInternoSimulado } from '../../../src/externos/CadastroInternoSimulado';

function criarSistema(): SistemaRecomendacao {
    return new SistemaRecomendacao(
        new OrquestradorPadrao(new RepositorioProfissionalMemoria()),
        new SimilaridadeCosseno()
    );
}

const armazenamentos: [string, () => AdaptadorArmazenamento][] = [
    ['S3', () => new AdaptadorS3(new S3Simulado())],
    ['Google Cloud', () => new AdaptadorGoogleCloud(new GoogleCloudStorageSimulado())]
];

const pagamentos: [string, () => AdaptadorPagamento][] = [
    ['Stripe', () => new AdaptadorStripe(new StripeSimulado())],
    ['PagSeguro', () => new AdaptadorPagSeguro(new PagSeguroSimulado())]
];

const profissionais: [string, () => AdaptadorProfissional][] = [
    ['LinkedIn', () => new AdaptadorLinkedIn(new LinkedInSimulado())],
    ['Interno', () => new AdaptadorInterno(new CadastroInternoSimulado())]
];

describe('Adapter: a logica de negocio funciona com QUALQUER provedor', () => {

    describe.each(armazenamentos)('armazenamento via %s', (_nome, criar) => {
        it('salva, recupera e lista arquivos do projeto', () => {
            const sistema = criarSistema();
            sistema.configurarAdaptadores(
                criar(),
                new AdaptadorStripe(new StripeSimulado()),
                new AdaptadorInterno(new CadastroInternoSimulado())
            );

            const conteudo = Buffer.from('roteiro v1');
            const id = sistema.anexarArquivoAoProjeto('p1', 'roteiro.pdf', conteudo);

            expect(sistema.recuperarArquivo(id).toString()).toBe('roteiro v1');
            expect(sistema.listarArquivosDoProjeto('p1')).toEqual([id]);
            expect(sistema.listarArquivosDoProjeto('outro')).toEqual([]);
        });
    });

    describe.each(pagamentos)('pagamento via %s', (_nome, criar) => {
        it('paga, consulta, estorna e normaliza os status', () => {
            const sistema = criarSistema();
            sistema.configurarAdaptadores(
                new AdaptadorS3(new S3Simulado()),
                criar(),
                new AdaptadorInterno(new CadastroInternoSimulado())
            );

            const id = sistema.pagarProfissional(150.5, 'produtor-1', 'p1');
            expect(sistema.consultarPagamento(id)).toBe('APROVADO');

            expect(sistema.estornarPagamento(id)).toBe(true);
            expect(sistema.consultarPagamento(id)).toBe('ESTORNADO');

            expect(sistema.estornarPagamento(id)).toBe(false);
            expect(sistema.consultarPagamento('inexistente')).toBe('NAO_ENCONTRADO');
        });

        it('rejeita valor nao positivo antes de chamar o provedor', () => {
            const sistema = criarSistema();
            sistema.configurarAdaptadores(
                new AdaptadorS3(new S3Simulado()),
                criar(),
                new AdaptadorInterno(new CadastroInternoSimulado())
            );
            expect(() => sistema.pagarProfissional(0, 'a', 'b')).toThrow();
        });
    });

    describe.each(profissionais)('profissionais via %s', (_nome, criar) => {
        it('devolve objetos Profissional do NOSSO dominio', () => {
            const sistema = criarSistema();
            sistema.configurarAdaptadores(
                new AdaptadorS3(new S3Simulado()),
                new AdaptadorStripe(new StripeSimulado()),
                criar()
            );

            const lista = sistema.buscarProfissionaisExternos({});
            expect(lista.length).toBeGreaterThan(0);
            for (const p of lista) {
                expect(p.competencias.length).toBeGreaterThan(0);
                expect(p.precoMedio).toBeGreaterThan(0);
                expect(p.disponibilidade.contem(new Date('2030-01-01'))).toBe(true);
            }
        });
    });
});

describe('Adapter: detalhes de traducao', () => {
    it('Stripe recebe centavos; PagSeguro recebe texto decimal', () => {
        const stripe = new StripeSimulado();
        const pagseguro = new PagSeguroSimulado();

        const idS = new AdaptadorStripe(stripe).efetuarPagamento(10.5, 'a', 'b');
        const idP = new AdaptadorPagSeguro(pagseguro).efetuarPagamento(10.5, 'a', 'b');

        expect(stripe.retrieveCharge(idS)?.amount).toBe(1050);
        expect(pagseguro.consultarTransacao(idP)?.status).toBe(3);
    });

    it('LinkedIn converte endorsements em nivel (max 10) e tarifa/hora em preco mensal', () => {
        const adaptador = new AdaptadorLinkedIn(new LinkedInSimulado());
        const marina = adaptador.detalharProfissional('li-100');

        expect(marina.possui('direcao')?.nivel).toBe(10);
        expect(marina.possui('narrativa')?.nivel).toBe(5);
        expect(marina.precoMedio).toBe(40 * 160);
    });

    it('Interno converte a string de habilidades em Competencias', () => {
        const paula = new AdaptadorInterno(new CadastroInternoSimulado())
            .detalharProfissional('int-1');
        expect(paula.possui('som')?.nivel).toBe(9);
        expect(paula.competencias).toHaveLength(3);
    });

    it('filtra por competencia e repassa avaliacoes ao sistema externo', () => {
        const li = new LinkedInSimulado();
        const adaptador = new AdaptadorLinkedIn(li);
        expect(adaptador.listarProfissionais({ competencia: 'edicao' })).toHaveLength(1);

        adaptador.registrarAvaliacao('li-101', { nota: 8, comentario: 'otimo' });
        expect(li.recomendacoesRecebidas[0]).toEqual({ urn: 'li-101', stars: 4, text: 'otimo' });

        const cad = new CadastroInternoSimulado();
        new AdaptadorInterno(cad).registrarAvaliacao('int-1', { nota: 9 });
        expect(cad.notasGravadas).toEqual([{ codigo: 'int-1', nota: 9 }]);
    });

    it('erros claros para profissional inexistente', () => {
        expect(() => new AdaptadorLinkedIn(new LinkedInSimulado()).detalharProfissional('x')).toThrow();
        expect(() => new AdaptadorInterno(new CadastroInternoSimulado()).detalharProfissional('x')).toThrow();
    });

    it('arquivo inexistente gera erro em ambos os provedores', () => {
        expect(() => new AdaptadorS3(new S3Simulado()).recuperarArquivo('nada')).toThrow();
        expect(() => new AdaptadorGoogleCloud(new GoogleCloudStorageSimulado()).recuperarArquivo('nada')).toThrow();
    });
});

describe('Adapter: configuracao obrigatoria', () => {
    it('falha com mensagem clara se nenhum adaptador foi configurado', () => {
        const sistema = criarSistema();
        expect(() => sistema.listarArquivosDoProjeto('p1')).toThrow('armazenamento');
        expect(() => sistema.pagarProfissional(10, 'a', 'b')).toThrow('pagamento');
        expect(() => sistema.buscarProfissionaisExternos({})).toThrow('profissional');
    });
});