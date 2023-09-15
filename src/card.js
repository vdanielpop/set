export default class Card {
  color
  amount
  filling
  shape

  /**
   * TODO Add enums for these properties.
   * @param color {string}
   * @param amount {string}
   * @param filling {string}
   * @param shape {string}
   */
  constructor (color, amount, filling, shape) {
    this.color = color
    this.amount = amount
    this.filling = filling
    this.shape = shape
  }

  /**
   * @returns {boolean}
   * @param c {Card}
   */
  equals (c) {
    return c.color === this.color && c.amount === this.amount && c.filling === this.filling && c.shape === this.shape
  }

  /**
   * @returns {string}
   */
  toString() {
    return [this.color, this.amount, this.filling, this.shape].join('-')
  }

  /**
   *
   * @param el {HTMLDivElement}
   * @returns {Card}
   */
  static fromDivWithDataAttributes (el) {
    return new Card(
      el.getAttribute('data-color'),
      el.getAttribute('data-amount'),
      el.getAttribute('data-filling'),
      el.getAttribute('data-shape'),
    )
  }
}