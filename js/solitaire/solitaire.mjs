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
  static 戻す = new CommandName("戻す");
}

class SolitaireLog {
  /** @type {{裏面デッキ: Deck, 表面デッキ: Deck}[]} */
  場札
  /** @type {{裏面デッキ: Deck, 表面デッキ: Deck}} */
  手札
  /** @type {Deck[]} */
  組札

  /**
   * 
   * @param {{裏面デッキ: Deck, 表面デッキ: Deck}[]} 場札 
   * @param {{裏面デッキ: Deck, 表面デッキ: Deck}} 手札 
   * @param {Deck[]} 組札 
   */
  constructor(場札, 手札, 組札) {
    this.場札 = 場札;
    this.手札 = 手札;
    this.組札 = 組札;

  }
}

/**
 * 履歴
 */
class History {
  /** @type {SolitaireLog[]} */
  values = [];

  保持できる履歴の数 = 100;

  /**
   * 
   * @param {SolitaireLog} log 
   */
  add(log) {
    this.values.push(log);
    if(this.values.length > this.保持できる履歴の数) {
      this.values.shift();
    }
  }
  pop() {
    return this.values.pop();
  }
}

export class Solitaire {
  /** @type {TableauDecks} */
  場札
  /** @type {StockDeck} */
  手札;
  /** @type {FoundationDecks} */
  組札;

  /**
   * @type {History}
   */
  #履歴;

  /** @type {undefined | ((v:CommandName)=>void)} */
  変更リスナー

  /** @type {undefined | (()=>void)} */
  完成リスナー

  /**
   * 
   * @param {Deck} デッキ 
   * @param {History} 履歴 
   */
  constructor(デッキ, 履歴) {
    this.#履歴 = 履歴;
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

    this.組札 = new FoundationDecks([FoundationDeck.empty(), FoundationDeck.empty(), FoundationDeck.empty(), FoundationDeck.empty()])
  }

  static newGame() {
    const デッキ = Solitaire.シャッフルされたデッキを作る();
    return new Solitaire(デッキ, new History());
  }

  /**
   * 
   * @param {Card} カード 
   * @param {number} 場札番号 
   */
  カードを場札に移動する(カード, 場札番号) {
    this.#履歴.add(this.toDeck());
    if(!this.場札.にカードを置ける(カード, 場札番号)) {
      return false;
    }
    const 移動するデッキ = this.デッキを取り出す(カード);
    this.場札.にデッキを移動する(移動するデッキ, 場札番号);

    this.#変更を非同期で通知する(CommandName.カードを場札に移動する);
    return true;
  }

  /**
   * 
   * @param {Card} カード 
   * @returns 
   */
  カードを組札移動する(カード) {
    this.#履歴.add(this.toDeck());
    if(this.場札.カードがある(カード) && !this.場札.カードは最後の1枚である(カード)) {
      return false;
    }
    if(!this.組札.にカードを置ける(カード)) {
      return false;
    }
    const 移動するデッキ = this.デッキを取り出す(カード);
    const 移動するカード = 移動するデッキ.最後のカード

    this.組札.にカードを移動する(移動するカード);
    this.#変更を非同期で通知する(CommandName.カードを組札移動する);
    if(this.完成した() && this.完成リスナー) {
      setTimeout(() => {
        this.完成リスナー && this.完成リスナー()
      }, 0);
    }
    return true;
  }

  手札を1枚めくる() {
    this.#履歴.add(this.toDeck());
    this.手札.を1枚めくる();
    this.#変更を非同期で通知する(CommandName.手札を1枚めくる);
  }

  戻す() {
    const log = this.#履歴.pop();
    if(!log) {
      return;
    }
    this.場札 = new TableauDecks(log.場札.map(v => new TableauDeck(new FixedFaceDeck(Face.裏, v.裏面デッキ), new FixedFaceDeck(Face.表, v.表面デッキ))));
    this.手札 = new StockDeck(new FixedFaceDeck(Face.裏, log.手札.裏面デッキ), new FixedFaceDeck(Face.表, log.手札.表面デッキ))
    this.組札 = new FoundationDecks(log.組札.map(v => new FoundationDeck(new FixedFaceDeck(Face.表, v))))
    this.#変更を非同期で通知する(CommandName.戻す);
  }

  /**
   * 
   * @param {CommandName} command 
   */
  #変更を非同期で通知する(command) {
    if(this.変更リスナー) {
      setTimeout(() => {
        this.変更リスナー && this.変更リスナー(command)
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
    this.#変更を非同期で通知する(CommandName.リフレッシュ);
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
    const デッキ = new Deck(cards.reverse());
    デッキ.をシャッフルする();
    return デッキ;
  }

  toDeck() {
    return {
      場札: this.場札.toDeck(),
      手札: this.手札.toDeck(),
      組札: this.組札.toDeck()
    }
  }
}

