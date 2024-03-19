import { Card, Face } from "./card.mjs";

export class Deck {
  /** @type {Card[]} */
  values = [];

  /**
   * 
   * @param {Card[]} values 
   */
  constructor(values) {
    this.values = values;
  }

  get 枚数() { return this.values.length }

  get が空() { return this.values.length == 0 };
  get が空でない() { return !this.が空 };

  /**
   * 
   * @param {Card} カード 
   */
  加える(カード) {
    this.values.push(カード);
  }

  /**
   * 
   * @param {Deck} デッキ 
   */
  デッキを加える(デッキ) {
    デッキ.values.forEach(v => this.values.push(v));
    // this.values.concat(デッキ.values);
  }

  をシャッフルする() {
    this.values = shuffle(this.values);
  }

  /**
   * 
   * @returns {Card}
   */
  最後のカードを取り出す() {
    if(this.values.length == 0) {
      throw new Error("デッキが空です");
    }
    // @ts-ignore
    return this.values.pop();
  }
  /**
   * 
   * @param {number} 枚数 
   */
  最後から取り出す(枚数) {
    if(枚数 > this.枚数) {
      throw new Error("デッキの枚数より多い");
    }
    const result = new Deck(this.values.slice(this.枚数 - 枚数))
    this.values = this.values.slice(0, this.枚数 - 枚数);
    return result;
  }

  /**
   * 
   * @param {Card} カード 
   */
  以降を取り出す(カード) {
    for(var 最後からの枚数 = 1; 最後からの枚数 <= this.values.length; 最後からの枚数++) {
      if(this.values[this.values.length - 最後からの枚数].と(カード).が同じ()) {
        return this.最後から取り出す(最後からの枚数);
      }
    }
    throw new Error("カードがない");
  }

  get 最後のカード() { return this.values[this.values.length - 1]}
  get 最初のカード() { return this.values[0]}

  /**
   * 
   * @param {Face} 裏表 
   */
  すべての裏表を揃える(裏表) {
    if(裏表.が裏) {
      this.values.forEach(v => v.裏にする())
    } else {
      this.values.forEach(v => v.表にする())
    }
  }

  /**
   * 
   * @param {Card} カード 
   * @returns 
   */
  含む(カード) {
    return !!this.values.find(v => v.と(カード).が同じ())
  }

  逆順にする() {
    this.values = this.values.reverse();
  }

  /**
   * 
   * @param {Card} card 
   * @returns 
   */
  static fromCard(card) {
    return new Deck([card]);
  }

  toObject() {
    return this.values.map(v => v.toObject())
  }
}

/**
 * 
 * @param {Array} array 
 * @returns {Array}
 */
export function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // 配列が残っている間、シャッフルを続ける
  while (0 !== currentIndex) {

      // 配列から要素を選びます
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // そしてそれを配列の現在の要素と交換します
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
  }

  return array;
}