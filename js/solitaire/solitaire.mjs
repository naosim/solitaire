import { Card, Face, Mark } from "./card.mjs";
import { Deck, shuffle } from "./deck.mjs";
import { FixedFaceDeck } from "./fixedFaceDeck.mjs";
import { FoundationDeck, FoundationDecks } from "./foundationDeck.mjs";
import { StockDeck } from "./stockDeck.mjs";
import { TableauDeck, TableauDecks } from "./tableauDeck.mjs";

export class CommandName {
  /** @type {string} */
  value;
  /**
   * 
   * @param {string} value 
   */
  constructor(value) {
    this.value = value;
  }
  /**
   * 
   * @param {CommandName} other 
   * @returns 
   */
  eq(other) {
    return this.value == other.value;
  }

  static カードを場札に移動する = new CommandName("カードを場札に移動する");
  static カードを組札移動する = new CommandName("カードを組札移動する");
  static 手札を1枚めくる = new CommandName("手札を1枚めくる");
  static リフレッシュ = new CommandName("リフレッシュ");
}

export class Solitaire {
  /** @type {TableauDecks} */
  場札
  /** @type {StockDeck} */
  手札;
  /** @type {FoundationDecks} */
  組札;

  /** @type {undefined | ((v:CommandName)=>void)} */
  変更リスナー

  /** @type {undefined | (()=>void)} */
  完成リスナー

  constructor() {
    const デッキ = Solitaire.シャッフルされたデッキを作る();
    const 場札リスト = [0, 1, 2, 3, 4, 5, 6]
    .map(v => {
      const cards = [];
      for(var i = 0; i < v; i++) {
        cards.push(デッキ.最後のカードを取り出す())
      }
      return cards
    })
    .map(v => ({裏: new Deck(v), 表: new Deck([デッキ.最後のカードを取り出す()])}))
    .map(v => new TableauDeck(FixedFaceDeck.作成(Face.裏, v.裏), FixedFaceDeck.作成(Face.表, v.表)))
    this.場札 = new TableauDecks(場札リスト);

    this.手札 = new StockDeck(FixedFaceDeck.作成(Face.裏, デッキ.ソートする()), new FixedFaceDeck(Face.表, new Deck([])))

    this.組札 = new FoundationDecks([new FoundationDeck(), new FoundationDeck(), new FoundationDeck(), new FoundationDeck()])
  }

  /**
   * 
   * @param {Card} カード 
   * @param {number} 場札番号 
   */
  カードを場札に移動する(カード, 場札番号) {
    if(!this.場札.にカードを置ける(カード, 場札番号)) {
      return false;
    }
    const 移動するデッキ = this.デッキを取り出す(カード);
    this.場札.にデッキを移動する(移動するデッキ, 場札番号);
    if(this.変更リスナー) {
      setTimeout(() => {
        this.変更リスナー && this.変更リスナー(CommandName.カードを場札に移動する)
      }, 0);
    }

    return true;
  }

  /**
   * 
   * @param {Card} カード 
   * @returns 
   */
  カードを組札移動する(カード) {
    if(this.場札.カードがある(カード) && !this.場札.カードは最後の1枚である(カード)) {
      return false;
    }
    if(!this.組札.にカードを置ける(カード)) {
      return false;
    }
    const 移動するデッキ = this.デッキを取り出す(カード);
    const 移動するカード = 移動するデッキ.最後のカード

    this.組札.にカードを移動する(移動するカード);
    if(this.変更リスナー) {
      setTimeout(() => {
        this.変更リスナー && this.変更リスナー(CommandName.カードを組札移動する)
      }, 0);
    }
    if(this.完成した() && this.完成リスナー) {
      setTimeout(() => {
        this.完成リスナー && this.完成リスナー()
      }, 0);
    }
    return true;
  }

  手札を1枚めくる() {
    this.手札.を1枚めくる();
    if(this.変更リスナー) {
      setTimeout(() => {
        this.変更リスナー && this.変更リスナー(CommandName.手札を1枚めくる)
      }, 0);
    }
  }

  /**
   * 
   * @param {Card} カード 
   * @return {Deck}
   */
  デッキを取り出す(カード) {
    // 手札から探す
    if(!this.手札.表面デッキ.が空 && this.手札.表面デッキ.最後のカード.と(カード).が同じ()) {
      return Deck.fromCard(this.手札.表面デッキ.最後のカードを取る())
    }

    //  組札から探す
    const 組札から取り出したデッキ = this.組札.デッキを取り出す(カード);
    if(組札から取り出したデッキ.が空でない) {
      return 組札から取り出したデッキ;
    }

    // 場札から探す
    const 場札から取り出したデッキ = this.場札.デッキを取り出す(カード);
    if(場札から取り出したデッキ.が空でない) {
      return 場札から取り出したデッキ
    }
    throw new Error("取り出すカードがない");
  }

  リフレッシュ() {
    if(!this.場札.リフレッシュ()) {
      return;
    }
    if(this.変更リスナー) {
      setTimeout(() => {
        this.変更リスナー && this.変更リスナー(CommandName.リフレッシュ)
      }, 0);
    }
  }

  バグチェック() {
    var count = this.組札.枚数 + this.場札.枚数 + this.手札.枚数
    return count == 52 
  }

  完成した() {
    return this.組札.完成した()
  }

  static シャッフルされたデッキを作る() {
    var cards = [];
    for(let マーク of Mark.すべて) {
      for(let 数字 = 1; 数字 < 14; 数字++) {
        cards.push(new Card(数字, マーク, Face.表))
      }
    }
    // shuffle(cards);
    // for(let マーク of Mark.すべて) {
    //   cards.push(new Card(1, マーク, Face.表));
    // }
    const デッキ = new Deck(cards.reverse());
    デッキ.をシャッフルする();
    return デッキ;
  }
}

