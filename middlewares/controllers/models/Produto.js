export class Produto {
  #id;
  #nome;
  #preco;
  #categoriaId;

  constructor({ id = null, nome, preco, categoria_id }) {
    this.#id = id;
    // atribui pelo setter para validar o nome
    this.nome = nome;
    // atribui pelo setter para validar o preço
    this.preco = preco;
    this.#categoriaId = categoria_id;
  }

  // getters
  get id() { return this.#id; }
  get nome() { return this.#nome; }
  get preco() { return this.#preco; }
  get categoriaId() { return this.#categoriaId; }

  // setters com validação
  set nome(valor) {
    if (typeof valor !== 'string' || valor.trim().length < 2) {
      throw new Error('Nome deve ter pelo menos 2 caracteres.');
    }
    this.#nome = valor.trim();
  }

  set preco(valor) {
    const n = Number(valor);
    if (!Number.isFinite(n) || n < 0) {
      throw new Error('Preço deve ser um número maior ou igual a zero.');
    }
    this.#preco = n;
  }

  // transforma o objeto do prisma em produto
  static fromDB(registro) {
    return new Produto(registro);
  }

  // transforma o produto no formato que o prisma espera
  paraBanco() {
    return {
      nome: this.#nome,
      preco: this.#preco,
      categoria_id: this.#categoriaId,
    };
  }

  // define como vira JSON no res.json()
  toJSON() {
    return {
      id: this.#id,
      nome: this.#nome,
      preco: this.#preco,
      categoria_id: this.#categoriaId,
    };
  }
}
