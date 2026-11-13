export class Entidade {
  #id;

  constructor(id = null) {
    this.#id = id;
  }

  get id() {
    return this.#id;
  }
}