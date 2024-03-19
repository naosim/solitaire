import { Face, Card } from "./card.mjs"
import { Deck } from "./deck.mjs"

/** 裏表が決まったデッキ */
export class FixedFaceDeck {
  /** @type {Deck} */
  デッキ
  // values = [];
  /** @type {Face} */
  裏表

  /**
   * 
   * @param {Face} 裏表 
   * @param {Deck} デッキ 
   */
  constructor(裏表, デッキ) {
    this.裏表 = 裏表
    this.デッキ = デッキ
  }

  get values() {
    return this.デッキ.values
  }

  get 枚数() {
    return this.デッキ.枚数;
  }

  get が空() {
    return this.デッキ.が空;
  }

  get が空でない() {
    return this.デッキ.が空でない;
  }

  get 最後のカード() {
    return this.デッキ.最後のカード
  }

  /**
   * @returns {Card}
   */
  最後のカードを取る() {
    if(this.が空) {
      throw new Error("デッキが空");
    }
    // @ts-ignore
    return this.values.pop(); // 空チェック済み
  }

  /**
   * 
   * @param {Card} カード 
   */
  と(カード) {
    // return {
    //   の裏表が同じ: () => this.裏表.と同じ(カード.裏表),
    //   の裏表が同じでない: () => !this.裏表.と同じ(カード.裏表)
    // }
    return {
      の裏表が同じ: () => this.裏表.と同じ(カード.裏表),
      の裏表が同じでない: () => !this.裏表.と同じ(カード.裏表)
    }
  }


  /**
   * 
   * @param {Card} カード 
   */
  に(カード) {
    return {
      を置く: () => {
        if(this.と(カード).の裏表が同じでない()) {
          throw new Error(`裏表が合わない`);
        }
        this.デッキ.加える(カード)
      }
    }
  }

  /**
   * 
   * @param {Card} カード 
   */
  含む(カード) {
    return this.デッキ.含む(カード);
  }

  /**
   * 
   * @param {Card} カード 
   */
  以降を取り出す(カード) {
    return this.デッキ.以降を取り出す(カード);
  }

  /**
   * 
   * @param {Deck} デッキ 
   */
  デッキを加える(デッキ) {
    this.デッキ.デッキを加える(デッキ);
  }

  /**
   * 
   * @param {Face} 表裏 
   * @param {Deck} デッキ 
   */
  static 作成(表裏, デッキ) {
    デッキ.すべての裏表を揃える(表裏);
    return new FixedFaceDeck(表裏, デッキ);
  }

  toObject() {
    return this.デッキ.toObject();
  }
}

