export class Produto {
  #id;
  #nome;
  #descricao;
  #imagemUrl;
  #preco;
  #quantidade;
  #categoriaId;
  #ativo;

  constructor({
    id = null,
    nome,
    descricao = null,
    imagem_url = null,
    preco,
    quantidade = 0,
    categoria_id = null,
    ativo = true,
  } = {}) {
    this.id = id;
    this.nome = nome;
    this.descricao = descricao;
    this.imagem_url = imagem_url;
    this.preco = preco;
    this.quantidade = quantidade;
    this.categoria_id = categoria_id;
    this.ativo = ativo;
  }

  get id() { return this.#id; }
  set id(valor) {
    if (valor !== null && (!Number.isInteger(Number(valor)) || Number(valor) <= 0)) {
      throw new TypeError('O ID do produto deve ser um inteiro positivo.');
    }
    this.#id = valor === null ? null : Number(valor);
  }

  get nome() { return this.#nome; }
  set nome(valor) {
    if (typeof valor !== 'string' || !valor.trim()) {
      throw new TypeError('Informe o nome do produto.');
    }
    this.#nome = valor.trim();
  }

  get descricao() { return this.#descricao; }
  set descricao(valor) {
    if (valor !== null && typeof valor !== 'string') {
      throw new TypeError('A descrição deve ser um texto.');
    }
    this.#descricao = valor?.trim() || null;
  }

  get imagem_url() { return this.#imagemUrl; }
  set imagem_url(valor) {
    if (valor !== null && typeof valor !== 'string') {
      throw new TypeError('A imagem do produto deve ser um texto.');
    }
    this.#imagemUrl = valor?.trim() || null;
  }

  get preco() { return this.#preco; }
  set preco(valor) {
    const preco = Number(valor);
    if (!Number.isFinite(preco) || preco < 0) {
      throw new TypeError('O preço deve ser maior ou igual a zero.');
    }
    this.#preco = preco;
  }

  get quantidade() { return this.#quantidade; }
  set quantidade(valor) {
    if (!Number.isInteger(valor) || valor < 0) {
      throw new TypeError('A quantidade deve ser um inteiro maior ou igual a zero.');
    }
    this.#quantidade = valor;
  }

  get categoria_id() { return this.#categoriaId; }
  set categoria_id(valor) {
    if (valor !== null && (!Number.isInteger(Number(valor)) || Number(valor) <= 0)) {
      throw new TypeError('A categoria deve ter um ID inteiro positivo.');
    }
    this.#categoriaId = valor === null ? null : Number(valor);
  }

  get ativo() { return this.#ativo; }
  set ativo(valor) {
    if (typeof valor !== 'boolean') {
      throw new TypeError('O campo ativo deve ser verdadeiro ou falso.');
    }
    this.#ativo = valor;
  }

  get valorTotalEmEstoque() {
    return Math.round(this.preco * this.quantidade * 100) / 100;
  }

  registrarEntrada(quantidade) {
    this.#validarQuantidadeMovimentada(quantidade);
    this.quantidade += quantidade;
    return true;
  }

  registrarSaida(quantidade) {
    this.#validarQuantidadeMovimentada(quantidade);
    if (quantidade > this.quantidade) return false;
    this.quantidade -= quantidade;
    return true;
  }

  toPersistence({ incluirQuantidade = true } = {}) {
    return {
      nome: this.nome,
      descricao: this.descricao,
      imagem_url: this.imagem_url,
      preco: this.preco,
      ...(incluirQuantidade ? { quantidade: this.quantidade } : {}),
      categoria_id: this.categoria_id,
      ativo: this.ativo,
    };
  }

  #validarQuantidadeMovimentada(quantidade) {
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      throw new TypeError('A quantidade movimentada deve ser um inteiro maior que zero.');
    }
  }
}
