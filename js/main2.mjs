import { Card, Face, Mark } from "./solitaire/card.mjs";
import { Solitaire } from "./solitaire/solitaire.mjs";
import { DeckType, CardViewMdel, CardViewMdelRepository } from "./view/view.mjs";


export class Assistant {
  /** @type {Solitaire} */
  ソリティア
  constructor(ソリティア) {
    this.ソリティア = ソリティア;
  }

  /**
   * 
   * @param {Card|null} 選択中のカード 
   */
  補助する(選択中のカード) {
    if(!選択中のカード) {
      return false;
    }
    if(選択中のカード.数字 == ソリティア.組札.最小の数 + 1) {
      ソリティア.カードを組札移動する(選択中のカード);
      return true;
    }
    return false;

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

/**
 * @param {Solitaire} ソリティア 
 * @param {(c:Card, d:DeckType, i:number)=>void} cb
 */
function forEachCard(ソリティア, cb) {
  ソリティア.組札.forEach((v, n) => {
    v.values.forEach((c, i) => {
      cb(c, DeckType.組札[n], i);
    })
  })

  ソリティア.手札.表面デッキ.values.forEach((c, i) => cb(c, DeckType.手札表, i));
  ソリティア.手札.裏面デッキ.values.forEach((c, i) => cb(c, DeckType.手札裏, i));

  ソリティア.場札.forEach((v, n) => {
    v.values.forEach((c, i) => {
      cb(c, DeckType.場札[n], i);
    })
  });
}

/**
 * 
 * @param {Card} カード 
 */
function カードが押された(カード) {
  選択中のカード = カード;
  console.log(カード.数字)
  draw(ソリティア);
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
  ソリティア.カードを場札に移動する(選択中のカード, 場札番号);
  選択中のカード = null;
  draw(ソリティア);
  
  setTimeout(() => {
    ソリティア.リフレッシュ();  
    draw(ソリティア);
  }, 500);
  
  
  if(!ソリティア.バグチェック()) {
    alert("枚数が不整合です");
  }
}

function 選択中のカードを組札に置く() {
  if(!選択中のカード) {
    return;
  }
  ソリティア.カードを組札移動する(選択中のカード);
  選択中のカード = null;
  draw(ソリティア);

  setTimeout(() => {
    ソリティア.リフレッシュ();  
    draw(ソリティア);
  }, 500);
  if(!ソリティア.バグチェック()) {
    alert("枚数が不整合です");
  }
}

/**
 * @type {HTMLElement[]}
 */
const tableauButtons = [];

/**
 * @type {HTMLElement}
 */
var 組札におくボタン;

/** @type {Assistant} */
var アシスタント;

/**
 * @param {Solitaire} ソリティア 
 */
function setup(ソリティア) {
  アシスタント = new Assistant(ソリティア);
  forEachCard(ソリティア, (c, d, i) => {
    const vm = CardViewMdel.create(c, カードが押された);
    vm.裏表 = c.裏表;
    cardViewMdelRepository.add(vm);
    qs("#app").appendChild(vm.element);
    // console.log(vm.id, d.value, i);
  })

  組札におくボタン = createElement("button", v => {
    v.innerHTML = "ここにおく";
    v.style.left = "100px";
    v.style.top = "140px";
    v.addEventListener("click", () => {
      選択中のカードを組札に置く();
    })
  })
  qs("#app").appendChild(組札におくボタン);

  const 手札をめくるボタン = createElement("button", v => {
    v.innerHTML = "めくる";
    v.style.left = "600px";
    v.style.top = "140px";
    v.addEventListener("click", () => {
      ソリティア.手札を1枚めくる();
      選択中のカード = null;
      draw(ソリティア);
    })
  })
  qs("#app").appendChild(手札をめくるボタン);

  [0, 1, 2, 3, 4, 5, 6].forEach(i => {
    const 場札に置くボタン = createElement("button", v => {
      v.innerHTML = "ここにおく";
      v.id = `tableauButton${i}`;
      v.className = "tableauButton"
      v.style.left = `${100 * i}px`;
      v.style.top = "500px";
      v.style.zIndex = "1000000000";
      v.addEventListener("click", () => {
        console.log("click");
        選択中のカードを場札に置く(i)
      })
    })
    tableauButtons.push(場札に置くボタン);
    qs("#app").appendChild(場札に置くボタン);
  })

  ソリティア.リフレッシュ();
  draw(ソリティア);
}

/**
 * 
 * @param {Solitaire} ソリティア 
 */
function draw(ソリティア) {
  forEachCard(ソリティア, (c, d, i) => {
    const vm = cardViewMdelRepository.find(CardViewMdel.toId(c));
    vm.裏表 = c.裏表;
    vm.選択している = !!選択中のカード && 選択中のカード.と(c).が同じ()
    vm.位置を設定する2(d, i, ソリティア.場札);
  })

  const 組札におくボタンを表示できる = 選択中のカード && ソリティア.組札.にカードを置ける(選択中のカード);
  組札におくボタン.style.display = 組札におくボタンを表示できる ? "block" : "none";
  tableauButtons.forEach((v, i) => {
    const おくボタンを表示できる = 選択中のカード && ソリティア.場札.にカードを置ける(選択中のカード, i);
    v.style.display = おくボタンを表示できる ? "block" : "none"

    const y =  ソリティア.場札.場札[i].裏面デッキ.枚数 * 4 + ソリティア.場札.場札[i].表面デッキ.枚数 * 32;
    v.style.top = `${300 + 60 + y}px`;
  })

  if(アシスタント.補助する(選択中のカード)) {
    選択中のカード = null;
    ソリティア.リフレッシュ();
    draw(ソリティア);
  }
}

/** @type {Card | null} */
var 選択中のカード = null;
const ソリティア = new Solitaire();
window["ソリティア"] = ソリティア
const cardViewMdelRepository = new CardViewMdelRepository();
setup(ソリティア);