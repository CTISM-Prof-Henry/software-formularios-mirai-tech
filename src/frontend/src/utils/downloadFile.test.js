import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadBlob } from './downloadFile';

describe('downloadBlob', () => {
  let mockLink;

  beforeEach(() => {
    mockLink = {
      href: '',
      setAttribute: vi.fn(),
      click: vi.fn(),
      remove: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:fake-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('cria URL de objeto a partir do blob', () => {
    const data = new Blob(['conteudo']);
    downloadBlob(data, 'arquivo.xlsx');
    expect(URL.createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
  });

  it('cria um elemento <a>', () => {
    downloadBlob(new Blob(), 'arquivo.xlsx');
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('define o atributo download com o nome do arquivo', () => {
    downloadBlob(new Blob(), 'relatorio.pdf');
    expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'relatorio.pdf');
  });

  it('define o href como a URL do blob', () => {
    downloadBlob(new Blob(), 'arquivo.xlsx');
    expect(mockLink.href).toBe('blob:fake-url');
  });

  it('aciona o clique no link', () => {
    downloadBlob(new Blob(), 'arquivo.xlsx');
    expect(mockLink.click).toHaveBeenCalledOnce();
  });

  it('remove o link após o clique', () => {
    downloadBlob(new Blob(), 'arquivo.xlsx');
    expect(mockLink.remove).toHaveBeenCalledOnce();
  });

  it('revoga a URL do objeto após o download', () => {
    downloadBlob(new Blob(), 'arquivo.xlsx');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});
