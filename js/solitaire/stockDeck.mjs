import { Face } from "./card.mjs";
import { Deck } from "./deck.mjs";
import { FixedFaceDeck } from "./fixedFaceDeck.mjs";

/**
 * 手札
 */
export class StockDeck {
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

  get 枚数() { return this.裏面デッキ.枚数 + this.表面デッキ.枚数 }

  を1枚めくる() {
    if(this.裏面デッキ.枚数 == 0) {
      this.表面デッキ.デッキ.逆順にする();
      this.裏面デッキ = FixedFaceDeck.作成(Face.裏, this.表面デッキ.デッキ);
      this.表面デッキ = new FixedFaceDeck(Face.表, new Deck([]));
    }
    const カード = this.裏面デッキ.最後のカードを取る();
    カード.表にする();
    this.表面デッキ.に(カード).を置く();
  }
  toDeck() {
    return {
      裏面デッキ: this.裏面デッキ.toDeck(),
      表面デッキ: this.表面デッキ.toDeck(),
    }
  }
}
