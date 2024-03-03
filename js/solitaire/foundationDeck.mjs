import { Face, Card } from "./card.mjs";
import { Deck } from "./deck.mjs";
import { FixedFaceDeck } from "./fixedFaceDeck.mjs";

/**
 * 組札
 */
export class FoundationDeck {
  /** @type {FixedFaceDeck} */
  デッキ = new FixedFaceDeck(Face.表, new Deck([]));

  get values() { return this.デッキ.values }

  get 枚数() { return this.values.length }

  get 最後のカード() {return this.デッキ.最後のカード }

  最後のカードを取る() { return this.デッキ.最後のカードを取る() }

  get が空() { return this.デッキ.が空 };
  get が空でない() { return this.デッキ.が空でない };

  /**
   * 
   * @param {Card} カード 
   */
  に(カード) {
    const カードを置ける = () => {
      if(this.デッキ.と(カード).の裏表が同じでない()) {
        return false;
      }
      if(this.デッキ.が空) {
        return カード.数字 == 1;
      }
      const 最後のカード = this.デッキ.最後のカード;
      const 同じマーク = 最後のカード.と(カード).が同じマーク();
      const 数字が1つ上 = 最後のカード.数字 + 1 == カード.数字;
      return 同じマーク && 数字が1つ上 
    };
    return {
      を置ける: カードを置ける,
      を置く: () => {
        if(!カードを置ける()) {
          throw new Error(`裏表が合わない`);
        }
        this.デッキ.に(カード).を置く();
      }
    }
  }
}

/**
 * 組札全体
 */
export class FoundationDecks {
  /** @type {FoundationDeck[]} */
  組札;

  get 枚数() { return this.組札.map(v => v.枚数).reduce((memo, v) => memo + v, 0)}

  get 最小の数() {
    return this.組札.map(v => v.枚数).reduce((memo, v) => memo > v ? v : memo, 13);
  }

  /**
   * 
   * @param {FoundationDeck[]} 組札 
   */
  constructor(組札) {
    if(組札.length != 4) {
      throw new Error("何かがおかしい");
    }
    this.組札 = 組札;
  }

  /**
   * 
   * @param {Card} カード 
   * @returns 
   */
  にカードを置ける(カード) {
    for(let i = 0; i < 4; i++) {
      if(this.組札[i].に(カード).を置ける()) {
        return true;
      }
    }
    return false;
  }

  にカードを移動する(カード) {
    if(!this.にカードを置ける(カード)) {
      throw new Error("組札に置けない");
    }

    // TODO カードが一番上かどうかの判定
    for(let i = 0; i < 4; i++) {
      if(this.組札[i].に(カード).を置ける()) {
        this.組札[i].に(カード).を置く();
        return;
      }
    }
  }

  /**
   * 
   * @param {Card} カード 
   * @return {Deck} ない場合は空のデッキを返す
   */
  デッキを取り出す(カード) {
    //  組札から探す
    for(let i = 0; i < 4; i++) {
      if(this.組札[i].が空でない && this.組札[i].最後のカード.と(カード).が同じ()) {
        return Deck.fromCard(this.組札[i].最後のカードを取る());
      }
    }
    return new Deck([]);// 空
  }

  /**
   * 
   * @param {(v:FoundationDeck, i:number) => void} cb 
   */
  forEach(cb) {
    this.組札.forEach(cb);
  }
  
}