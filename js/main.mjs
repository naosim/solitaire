import { Card } from "./solitaire/card.mjs";
import { Solitaire } from "./solitaire/solitaire.mjs";

class DeckType {
  /** @type {string} */
  value;

  /** @type {boolean} */
  最後のカードだけ選択できる

  /** @type {boolean}  */
  オーバーラップする

  /**
   * 
   * @param {string} value 
   */
  constructor(value, 最後のカードだけ選択できる, オーバーラップする) {
    this.value = value;
    this.最後のカードだけ選択できる = 最後のカードだけ選択できる;
    this.オーバーラップする = オーバーラップする;
    
  }

  static 組札 = new DeckType("組札", true, true);
  static 場札 = new DeckType("場札", false, true);
  static 手札 = new DeckType("手札", true, true);
}

class CardViewModel {
  /**
   * @type {Card}
   */
  カード

  /**
   * @type {DeckType}
   */
  デッキタイプ

  /** @type {boolean} */
  選択中

  /** @type {number} */
  デッキ上の位置

  /** @type {number} */
  デッキの枚数

  /**
   * @param {Card} カード
   * @param {DeckType} デッキタイプ
   * @param {boolean} 選択中
   * @param {number} デッキ上の位置
   * @param {number} デッキの枚数
   */
  constructor(カード, デッキタイプ, 選択中, デッキ上の位置, デッキの枚数) {
    this.カード = カード;
    this.デッキタイプ = デッキタイプ
    this.選択中 = 選択中;
    this.デッキ上の位置 = デッキ上の位置;
    this.デッキの枚数 = デッキの枚数;
  }

  get 色が赤() { return this.カード.が表 && this.カード.マーク.色が赤 }

  get 選択できる() {
    if(this.カード.が裏) {
      return false;
    }
    if(this.デッキタイプ.最後のカードだけ選択できる) {
      return this.デッキ上の位置 == this.デッキの枚数 - 1;
    } else {
      return true;
    }
  }

  get カード文字() {
    return CardString.変換する(this.カード);
  }
}


/**
 * 
 * @param {string} selector 
 * @returns {Element}
 */
function qs(selector) {
  // @ts-ignore
  return document.querySelector(selector)
}

/**
 * 
 * @param {string} name 
 * @param {(v:HTMLElement)=>void} cb 
 * @returns {HTMLElement}
 */
function createElement(name, cb) {
  const e = document.createElement(name);
  cb(e);
  return e;
}

const ソリティア = new Solitaire();
window["ソリティア"] = ソリティア

class CardString {
  static chars = {
    スペード: ["🂡","🂢","🂣","🂤","🂥","🂦","🂧","🂨","🂩","🂪","🂫","🂭","🂮"],
    ハート:   ["🂱","🂲","🂳","🂴","🂵","🂶","🂷","🂸","🂹","🂺","🂻","🂽","🂾"],
    ダイヤ:   ["🃁","🃂","🃃","🃄","🃅","🃆","🃇","🃈","🃉","🃊","🃋","🃍","🃎"],
    クラブ:   ["🃑","🃒","🃓","🃔","🃕","🃖","🃗","🃘","🃙","🃚","🃛","🃝","🃞"],
  };

  static marks = {
    スペード: "♠",
    ハート:   "♥",
    ダイヤ:   "♦",
    クラブ:   "♣",
  }

  /**
   * 
   * @param {Card} カード 
   * @returns {string}
   */
  static 変換する(カード) {
    if(カード.が裏) {
      return "■■";
    }
    var num = [0,1,2,3,4,5,6,7,8,9,10,"J","Q","K"]
    return `${CardString.marks[カード.マーク.value]}${num[カード.数字]}`
    return CardString.chars[カード.マーク.value][カード.数字 - 1]
  }
}

/** @type {Card | null} */
var 選択中のカード = null;
/**
 * 
 * @param {Card} カード 
 */
function 選択中のカードを設定する(カード) {
  選択中のカード = カード
  redraw();
}

/**
 * 
 * @param {CardViewModel} cardVM 
 * @param {Card | null} 選択中のカード 
 */
function cardToSpan(cardVM, 選択中のカード) {
  const span = document.createElement("span");
  const classNames = ["card"];
  classNames.push(cardVM.色が赤 ? 'red-card' : 'black-card');
  if(選択中のカード && cardVM.カード.と(選択中のカード).が同じ()) {
    classNames.push("selected");
  }
  if(cardVM.デッキタイプ.オーバーラップする) {
    classNames.push("overlap");
  }
  span.className = classNames.join(" ");
  span.innerHTML = cardVM.カード文字;
  return span;
}

const cardHeight = 40;

/**
 * 
 * @param {Card[]} cards 
 * @param {DeckType} デッキタイプ
 */
function cardsToElement(cards, デッキタイプ) {
  const div = document.createElement("div");
  div.className = "deck";
  cards
    .map((v, i) => new CardViewModel(v, デッキタイプ, !!選択中のカード && 選択中のカード.と(v).が同じ(), i, cards.length))
    .map((v, i) => { 
      const span = cardToSpan(v, 選択中のカード);
      span.style.top = `${i * cardHeight}px`;
      span.style.lineHeight = "40px"
      if(v.選択できる) {
        span.style.cursor = "pointer";
        span.addEventListener("click", () => 選択中のカードを設定する(v.カード))
      }
      return span
  }).forEach(v => div.appendChild(v));
  return div;
}

/**
 * 
 * @param {Card[]} cards 
 * @param {DeckType} デッキタイプ
 */
function cardsToElementForFoundation(cards, デッキタイプ) {
  const div = document.createElement("div");
  div.className = "deck";
  cards
    .map((v, i) => new CardViewModel(v, デッキタイプ, !!選択中のカード && 選択中のカード.と(v).が同じ(), i, cards.length))
    .map((v, i) => { 
      const span = cardToSpan(v, 選択中のカード);
      span.style.top = `${i * 2}px`;
      span.style.lineHeight = "40px"
      if(v.選択できる) {
        span.style.cursor = "pointer";
        span.addEventListener("click", () => 選択中のカードを設定する(v.カード))
      }
      return span
  }).forEach(v => div.appendChild(v));
  return div;
}

/**
 * 
 * @param {Card[]} cards 
 * @param {DeckType} デッキタイプ
 */
function cardsToElementForStock(cards, デッキタイプ) {
  const div = document.createElement("div");
  div.className = "deck";
  cards
    .map((v, i) => new CardViewModel(v, デッキタイプ, !!選択中のカード && 選択中のカード.と(v).が同じ(), i, cards.length))
    .map((v, i) => { 
      const span = cardToSpan(v, 選択中のカード);
      span.style.top = `${2 * i}px`;
      span.style.lineHeight = "40px"
      if(v.選択できる) {
        span.style.cursor = "pointer";
        span.addEventListener("click", () => 選択中のカードを設定する(v.カード))
      }
      return span
  }).forEach(v => div.appendChild(v));
  return div;
}

function 手札を表示する() {
  // 手札
  qs("#stockField").appendChild(createElement("h2", v => v.innerHTML = "手札"));



  [
    ソリティア.手札.裏面デッキ.values,
    ソリティア.手札.表面デッキ.values,
  ].forEach((v, i) => {
    const d = cardsToElementForStock(v, DeckType.手札);
    d.style.left = `${100 * i}px`;
    qs("#stockField").appendChild(d);
  })
}

function redraw() {
  const div = qs("#app");
  div.innerHTML = "";
  qs("#tableauField").innerHTML = "";
  qs("#stockField").innerHTML = ""

  // 組札
  div.appendChild(createElement("h2", v => v.innerHTML = "組札"));
  ソリティア.組札.forEach((v, i) => {
    const d = cardsToElementForFoundation(v.values, DeckType.組札);
    d.style.left = `${i * 100}px`;
    div.appendChild(d)
  });
  div.appendChild(createElement("span", v => {
    v.className ="button";
    v.style.width = "180px"
    v.style.top = `180px`;
    if(選択中のカード && ソリティア.組札.にカードを置ける(選択中のカード)) {
      v.innerHTML = "組札に置く";
      v.addEventListener("click", () => 選択中のカードを組札に置く())
    }
  }));
  
  // 場札
  qs("#tableauField").appendChild(createElement("h2", v => v.innerHTML = "場札"));
  ソリティア.場札.forEach((v, i) => {
    const deckDiv = cardsToElement(v.values, DeckType.場札);
    deckDiv.style.left = `${i * 100}px`
    qs("#tableauField").appendChild(deckDiv);
    if(選択中のカード && ソリティア.場札.にカードを置ける(選択中のカード, i)) {
      deckDiv.appendChild(createElement("span", (e) => {
        e.className = "button"
        e.innerHTML = "ここへ";
        e.style.top = `${v.枚数 * cardHeight + 20}px`;
        e.addEventListener("click", () => 選択中のカードを場札に置く(i))
      }));
    }
  });

  手札を表示する();
  // qs("#selectedCard").innerHTML = 選択中のカード ? CardString.変換する(選択中のカード) : "" ;
}

qs("#openStockButton").addEventListener("click", () => {
  ソリティア.手札を1枚めくる();
  redraw();
})

window["redraw"] = redraw;
window["Card"] = Card;

function 選択中のカードを組札に置く() {
  if(!選択中のカード) {
    return;
  }
  ソリティア.カードを組札移動する(選択中のカード);
  ソリティア.リフレッシュ();
  選択中のカード = null;
  redraw();
  if(!ソリティア.バグチェック()) {
    alert("枚数が不整合です");
  }
}

/**
 * 
 * @param {number} 場札番号 
 * @returns 
 */
function 選択中のカードを場札に置く(場札番号) {
  if(!選択中のカード) {
    return;
  }
  console.log(選択中のカード, 場札番号);
  ソリティア.カードを場札に移動する(選択中のカード, 場札番号)
  ソリティア.リフレッシュ();
  選択中のカード = null;
  redraw();
  if(!ソリティア.バグチェック()) {
    alert("枚数が不整合です");
  }
}

redraw();
