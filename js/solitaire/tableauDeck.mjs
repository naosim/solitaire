import { Card } from "./card.mjs";
import { Deck } from "./deck.mjs";
import { FixedFaceDeck } from "./fixedFaceDeck.mjs";

export class TableauDeck {
  裏面デッキ;
  表面デッキ;
  /**
   * 
   * @param {FixedFaceDeck} 裏面デッキ 
   * @param {FixedFaceDeck} 表面デッキ 
   */
  constructor(裏面デッキ, 表面デッキ) {
    if(裏面デッキ.裏表.が表) {
      throw new Error("裏面デッキが表")
    }
    if(表面デッキ.裏表.が裏) {
      throw new Error("裏面デッキが裏")
    }
    this.裏面デッキ = 裏面デッキ;
    this.表面デッキ = 表面デッキ;
  }
  get 枚数() {
    return this.裏面デッキ.枚数 + this.表面デッキ.枚数;
  }
  get が空() {
    return this.枚数 == 0;
  }

  get values() {
    return [...this.裏面デッキ.values, ...this.表面デッキ.values];
  }

  リフレッシュ() {
    if(this.表面デッキ.枚数 > 0) {
      return;
    }
    if(this.裏面デッキ.が空) {
      return;
    }
    const 裏面デッキの最後のカード = this.裏面デッキ.最後のカードを取る();
    裏面デッキの最後のカード.表にする();
    this.表面デッキ.に(裏面デッキの最後のカード).を置く();
  }

  /**
   * 
   * @param {Deck} デッキ 
   * @returns {boolean}
   */
  にデッキを置ける(デッキ) {
    const 最初のカード = デッキ.最初のカード;
    return this.に(最初のカード).を置ける()
  }

  /**
   * 
   * @param {Deck} デッキ 
   */
  にデッキを置く(デッキ) {
    if(!this.にデッキを置ける(デッキ)) {
      throw new Error("おけない");
    }
    this.表面デッキ.デッキを加える(デッキ)
  }

  /**
   * 
   * @param {Card} カード 
   * @returns 
   */
  に(カード) {
    const カードを置ける = () => {
      if(カード.が裏) {
        return false;
      }
      if(this.が空) {
        return カード.数字 == 13
      }
      if(this.表面デッキ.が空) {
        return true;
      }
      const 表面デッキの最後のカード = this.表面デッキ.最後のカード;
      return 表面デッキの最後のカード.と(カード).が違う色() && 表面デッキの最後のカード.数字 - 1 == カード.数字
    };
    
    return {
      を置ける: カードを置ける,
      を置く: () => {
        if(!カードを置ける()) {
          throw new Error("カードを置けない");
        }
        this.表面デッキ.に(カード).を置く();
      }
    }
  }
}

/**
 * 場札全体
 */
export class TableauDecks {
 /** @type {TableauDeck[]} */
 場札

 get 枚数() { return this.場札.map(v => v.枚数).reduce((memo, v) => memo + v, 0) }

 /**
  * 
  * @param {TableauDeck[]} 場札 
  */
 constructor(場札) {
  this.場札 = 場札
 }

 /**
 * 
 * @param {Card} カード 
 * @param {number} 場札番号 
 */
 にカードを置ける(カード, 場札番号) {
  const result = this.場札[場札番号].にデッキを置ける(new Deck([カード]));
  console.log(カード, 場札番号, result);
  return this.場札[場札番号].にデッキを置ける(new Deck([カード]))
 }

  /**
   * 
   * @param {Deck} デッキ 
   * @param {number} 場札番号 
   */
  にデッキを移動する(デッキ, 場札番号) {
    if(!this.にカードを置ける(デッキ.最初のカード, 場札番号)) {
      return false;
    }
    this.場札[場札番号].にデッキを置く(デッキ);
    return true;
  }

  /**
   * 
   * @param {Card} カード 
   * @return {Deck}
   */
  デッキを取り出す(カード) {
    for(let i = 0; i < 7; i++) {
      if(this.場札[i].表面デッキ.含む(カード)) {
        return this.場札[i].表面デッキ.以降を取り出す(カード)
      }
    }
    return new Deck([]);
  }

  リフレッシュ() {
    this.場札.forEach(v => v.リフレッシュ());
  }

  /**
   * 
   * @param {(v:TableauDeck, i: number) => void} cb 
   */
  forEach(cb) {
    this.場札.forEach(cb);
  }

}