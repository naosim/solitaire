import { Card, Face, Mark } from "../solitaire/card.mjs";
import { TableauDecks } from "../solitaire/tableauDeck.mjs";
import { size } from "./size.mjs";

export class DeckType {
  /** @type {string} */
  value;
  /** @type {string} */
  group;
  /** @type {number} */
  index;
  
  /**
   * 
   * @param {string} value 
   * @param {string} group
   * @param {number} index
   */
  constructor(value, group, index) {
    this.value = value;
    this.group = group;
    this.index = index;
  }

  static 組札0 = new DeckType("組札0", "組札", 0);
  static 組札1 = new DeckType("組札1", "組札", 1);
  static 組札2 = new DeckType("組札2", "組札", 2);
  static 組札3 = new DeckType("組札3", "組札", 3);
  static 組札 = [
    DeckType.組札0,
    DeckType.組札1,
    DeckType.組札2,
    DeckType.組札3,
  ];

  static 場札0 = new DeckType("場札0", "場札", 0);
  static 場札1 = new DeckType("場札1", "場札", 1);
  static 場札2 = new DeckType("場札2", "場札", 2);
  static 場札3 = new DeckType("場札3", "場札", 3);
  static 場札4 = new DeckType("場札4", "場札", 4);
  static 場札5 = new DeckType("場札5", "場札", 5);
  static 場札6 = new DeckType("場札6", "場札", 6);
  static 場札 = [
    DeckType.場札0,
    DeckType.場札1,
    DeckType.場札2,
    DeckType.場札3,
    DeckType.場札4,
    DeckType.場札5,
    DeckType.場札6,
  ]

  static 手札表 = new DeckType("手札表", "手札", 0);
  static 手札裏 = new DeckType("手札裏", "手札", 1);

}


export class CardViewMdel {
  /** @type {HTMLDivElement} */
  element
  /** @type {Card} */
  カード

  /** @type {Face} */
  #裏表 = Face.表

  #選択している = false;

  /**
   * @param {Face} 裏表 
   */
  set 裏表(裏表) {
    if(!this.#裏表.と同じ(裏表)) {
      this.#裏表 = 裏表;
      this.refreshClasName();
    }
    if(裏表.が表) {
      this.カード.表にする()
    }
    if(裏表.が裏) {
      this.カード.裏にする()
    }
  }

  /**
   * @param {boolean} v 
   */
  set 選択している(v) {
    if(this.#選択している != v) {
      this.#選択している = v;
      this.refreshClasName();
    }
    
  }

  

  /**
   * @param {string} id 
   * @param {Card} カード 
   * @param {(v:Card) => void} 表面カードが押されたイベント
   * @param {(v:Card) => void} 裏面カードが押されたイベント
   */
  constructor(id, カード, 表面カードが押されたイベント, 裏面カードが押されたイベント) {
    this.id = id;
    this.カード = カード
    const mark = CardViewMdel.toMarkChar(カード.マーク);
    const number = カード.数字 >= 11 ? ["J", "Q", "K"][カード.数字 - 11] : カード.数字;
    const innerHTML = `
  <div class="back"><img src="./img/cat2.png" width="52" /></div>
  <div class="front${カード.マーク.色が赤 ? ' red' : ''}">
    <div class="lefttop">
      <div class="mark">${mark}</div><div class="num">${number}</div>
    </div>
    <div class="big-mark">${mark}</div>
  </div>`
    this.element = document.createElement("div");
    this.element.id = this.id;
    this.element.className = "card";
    this.element.innerHTML = innerHTML;
    this.element.addEventListener("click", () => {
      if(this.#裏表.が裏) {
        裏面カードが押されたイベント(カード);
      } else {
        表面カードが押されたイベント(カード);// 表のときだけ
      }
      
    })
  }

  refreshClasName() {
    const classNames = ["card"];
    if(this.#裏表.が裏) {
      classNames.push("facedown");
    }
    if(this.#選択している) {
      classNames.push("selected");
    }
    this.element.className = classNames.join(" ");
  }

  位置を設定する(x, y) {
    this.element.style.left = x + "px";
    this.element.style.top = y + "px";
    this.element.style.zIndex = y * 10000 + x;
  }

  /**
   * 
   * @param {DeckType} deckType 
   * @param {number} i 
   * @param {TableauDecks} 場札
   */
  位置を設定する2(deckType, i, 場札) {
    const offsetX = size.カードグリッド.x;
    if(deckType.group == "場札") {
      const x = offsetX * deckType.index;
      let y = size.場札の開始位置.y + i * size.ズレ.裏札 + size.appMargin.top;
      if(this.#裏表.が表) {
        const 裏面枚数 = 場札.場札[deckType.index].裏面デッキ.枚数;
        y = size.場札の開始位置.y + 裏面枚数 * size.ズレ.裏札 + (i - 裏面枚数) * size.ズレ.表札 + size.appMargin.top;
      }
      this.位置を設定する(x, y);
    } else if(deckType.group == "組札") {
      const x = offsetX * deckType.index;
      const y = i * 4 + size.appMargin.top;
      this.位置を設定する(x, y);
    } else if(deckType.value == "手札裏") {
      const x = offsetX * 6;
      const y = i * 2 + size.appMargin.top;
      this.位置を設定する(x, y);
    } else if(deckType.value == "手札表") {
      const x = offsetX * 5;
      const y = i * 2 + size.appMargin.top;
      this.位置を設定する(x, y);
    }
  }

  /**
   * 
   * @param {Card} カード 
   */
  static toId(カード) {
    return `${カード.マーク.value}_${カード.数字}`
  }

  /**
   * 
   * @param {Mark} マーク 
   */
  static toMarkChar(マーク) {
    if(マーク.value == "ハート") {
      return "♥"
    }
    if(マーク.value == "スペード") {
      return "♠"
    }
    if(マーク.value == "クラブ") {
      return "♣"
    }
    if(マーク.value == "ダイヤ") {
      return "♦"
    }

  }

  /**
   * 
   * @param {Card} カード 
   * @param {(v:Card) => void} 表面カードが押されたイベント
   * @param {(v:Card) => void} 裏面カードが押されたイベント
   */
  static create(カード, 表面カードが押されたイベント, 裏面カードが押されたイベント) {
    return new CardViewMdel(CardViewMdel.toId(カード), カード,  表面カードが押されたイベント, 裏面カードが押されたイベント);
  }
}

export class CardViewMdelRepository {
  /** @type {Map<string, CardViewMdel>} */
  map = new Map();
  /**
   * 
   * @param {CardViewMdel} vm 
   */
  add(vm) {
    this.map.set(vm.id, vm);
  }

  /**
   * 
   * @param {string} id 
   * @returns 
   */
  find(id) {
    const result = this.map.get(id);
    if(!result) {
      throw new Error("notfound: " + id);
    }
    return result
  }
}