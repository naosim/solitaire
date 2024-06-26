import { Card, Face, Mark } from "./solitaire/card.mjs";
import { Deck } from "./solitaire/deck.mjs";
import { CommandName, Solitaire } from "./solitaire/solitaire.mjs";
import { size } from "./view/size.mjs";
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
      return this.最後のカードから組札に置けるカードを探す();
    }
    if(選択中のカード.数字 == ソリティア.組札.最小の数 + 1) {
      ソリティア.カードを組札移動する(選択中のカード);
      return true;
    }
    return this.選択中のカードが1箇所だけに移動できるなら移動する(選択中のカード);

  }
  最後のカードから組札に置けるカードを探す() {
    const 各デッキの最後のカードリスト = ソリティア.場札.場札.filter(v => v.表面デッキ.が空でない).map(v => v.表面デッキ.最後のカード);
    if(ソリティア.手札.表面デッキ.が空でない) {
      各デッキの最後のカードリスト.push(ソリティア.手札.表面デッキ.最後のカード);
    }

    const 移動できるカードリスト = 各デッキの最後のカードリスト.filter(v => ソリティア.組札.にカードを置ける(v) && v.数字 == ソリティア.組札.最小の数 + 1)
    if(移動できるカードリスト.length == 0) {
      return false;
    }
    移動できるカードリスト.forEach(v => ソリティア.カードを組札移動する(v));
    return true;
  }
  /**
   * 
   * @param {Card} 選択中のカード 
   */
  選択中のカードが1箇所だけに移動できるなら移動する(選択中のカード) {
    const 組札に置ける = this.ソリティア.組札.にカードを置ける(選択中のカード);
    const デッキ = new Deck([選択中のカード]);
    var 場札番号 = -1;
    const 場札に置ける数 = this.ソリティア.場札.場札.filter((v, i) => {
      if(v.にデッキを置ける(デッキ)) {
        場札番号 = i;
        return true;
      }
      return false;
    }).length

    if(場札に置ける数 == 0 && 組札に置ける) {
      this.ソリティア.カードを組札移動する(選択中のカード);
      return true;
    }
    if(場札に置ける数 == 1 && !組札に置ける) {
      this.ソリティア.カードを場札に移動する(選択中のカード, 場札番号);
      return true;
    }
    return false;
  }
  
}
window



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
  補助する();
}

/**
 * 
 * @param {Card} カード 
 */
function 裏面カードが押された(カード) {
  if(ソリティア.手札.裏面デッキ.含む(カード)) {
    ソリティア.手札を1枚めくる();
    選択中のカード = null;
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
  ソリティア.カードを場札に移動する(選択中のカード, 場札番号);
  選択中のカード = null;
  リフレッシュ();
  
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
  リフレッシュ();
  if(!ソリティア.バグチェック()) {
    alert("枚数が不整合です");
  }
}

/**
 * @type {HTMLElement[]}
 */
var tableauButtons = [];

/**
 * @type {HTMLElement}
 */
var 組札におくボタン;

/** @type {Assistant} */
var アシスタント;

function setup() {
  qs("#app").innerHTML = "";

  選択中のカード = null;
  ソリティア = Solitaire.newGame();
  cardViewMdelRepository = new CardViewMdelRepository();
  tableauButtons = [];

  ソリティア.変更リスナー = (v) => {
    if(v.eq(CommandName.リフレッシュ)) {
      sounds[1].play();
    } else if(v.eq(CommandName.手札を1枚めくる)) {
      // nop: 音を鳴らさない
    } else {
      sounds[0].play();
    }
    draw(ソリティア);

    if(!v.eq(CommandName.戻す)) {
      補助する();
    }
    
  }

  ソリティア.完成リスナー = () => {
    setTimeout(() => alert("かんせい！"), 1000) //アニメーションが終わってからキック 
  }

  アシスタント = new Assistant(ソリティア);
  forEachCard(ソリティア, (c, d, i) => {
    const vm = CardViewMdel.create(c, カードが押された, 裏面カードが押された);
    vm.裏表 = c.裏表;
    cardViewMdelRepository.add(vm);
    qs("#app").appendChild(vm.element);
    // console.log(vm.id, d.value, i);
  })

  組札におくボタン = createElement("button", v => {
    v.innerHTML = "組札に\nおく";
    v.style.left = "100px";
    v.style.top = "140px";
    v.style.zIndex = "20000000";
    v.className = "gameButton";
    //v.style.top = `${600 + size.appMargin.top}px`;
    v.addEventListener("click", () => {
      選択中のカードを組札に置く();
    })
  })
  qs("#app").appendChild(組札におくボタン);

  const めくるボタンが押されたときの挙動 = () => {
    ソリティア.手札を1枚めくる();
    選択中のカード = null;
  }
  const 手札をめくるボタン = createElement("button", v => {
    v.innerHTML = "めくる";
    v.style.left = size.カードグリッド.x * 6 + "px";
    v.style.top = `${20 + size.appMargin.top}px`;
    v.className = "gameButton";
    v.style.zIndex = "0";
    v.addEventListener("mousedown",めくるボタンが押されたときの挙動);
  })
  qs("#app").appendChild(手札をめくるボタン);

  const 手札をめくるボタン2 = createElement("button", v => {
    v.innerHTML = "手札をめくる";
    v.style.left = "80px";
    v.style.top = "700px";
    v.style.width = "300px";
    v.className = "gameButton";
    v.addEventListener("mousedown",めくるボタンが押されたときの挙動);
  })
  qs("#app").appendChild(手札をめくるボタン2);

  [0, 1, 2, 3, 4, 5, 6].forEach(i => {
    const 場札に置くボタン = createElement("button", v => {
      v.innerHTML = "ここにおく";
      v.id = `tableauButton${i}`;
      v.className = "tableauButton"
      v.style.left = `${size.カードグリッド.x * i}px`;
      v.style.top = `${500 + size.appMargin.top}px`;
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
  補助する();
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

    const y =  ソリティア.場札.場札[i].裏面デッキ.枚数 * size.ズレ.裏札 + ソリティア.場札.場札[i].表面デッキ.枚数 * size.ズレ.表札;
    v.style.top = `${size.場札の開始位置.y + size.card.height + y}px`;
  })
}

function リフレッシュ() {
  setTimeout(() => {
      ソリティア.リフレッシュ();
    }, 300)
}

function 補助する() {
  setTimeout(() => {
    if(アシスタント.補助する(選択中のカード)) {
      選択中のカード = null;
      リフレッシュ();
    }
  }, 300)
}

qs("#newGameButton").addEventListener("click", () => {
  setup();
})
qs("#backButton").addEventListener("click", () => {
  選択中のカード = null;
  ソリティア.戻す();
})

/** @type {Card | null} */
var 選択中のカード = null;
/** @type {Solitaire} */
var ソリティア;
/** @type {CardViewMdelRepository} */
var cardViewMdelRepository;
//タイプ音読み込み
const sounds = ['./sound/se1.mp3', './sound/se2.mp3'].map(v => new window["Howl"]({src: [v]}));
setup();