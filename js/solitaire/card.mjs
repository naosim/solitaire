/** 色 */
export class Color {
  #value;
  constructor(value) {
    this.#value = value;
  }
  get が黒() {
    return this.#value == "黒"
  }
  get が赤() {
    return this.#value == "赤"
  }
  /**
   * 
   * @param {Color} 他 
   * @returns 
   */
  と(他) {
    return {
      が同じ: () =>  this.#value == 他.#value
    }
  }

  static 赤 = new Color("赤");
  static 黒 = new Color("黒");
}

export class Mark {
  /** @type {string} */
  value;
  /** @type {Color} */
  色;
  constructor(value, 色) {
    this.value = value;
    this.色 = 色;
  }

  get 色が黒() {
    return this.色.が黒
  }
  get 色が赤() {
    return this.色.が赤
  }

  /**
   * 
   * @param {Mark} 他 
   * @returns 
   */
  と(他) {
    return {
      が同じ: () => this.value == 他.value,
      が同じ色: () => this.色.と(他.色).が同じ() ,
      が違う色: () => !this.色.と(他.色).が同じ() 
    }
  }

  static ハート = new Mark("ハート", Color.赤);
  static スペード = new Mark("スペード", Color.黒);
  static ダイヤ = new Mark("ダイヤ", Color.赤);
  static クラブ = new Mark("クラブ", Color.黒);
  static すべて = [Mark.クラブ, Mark.スペード, Mark.ダイヤ, Mark.ハート];
  
  /**
   * 
   * @param {string} text 
   * @returns {Mark}
   */
  static fromText(text) {
    const result = Mark.すべて.find(v => v.value == text);
    if(!result) {
      throw new Error("不明")
    }
    return result;
  }
}

/** 裏表 */
export class Face {
  /** @type {string} */
  #value
  constructor(value) {
    this.#value = value;
  }
  get value() {
    return this.#value;
  }
  get が裏() {
    return this.#value == "裏"
  }
  get が表() {
    return this.#value == "表"
  }
  /**
   * 
   * @param {Face} 裏表 
   */
  と同じ(裏表) {
    return this.#value == 裏表.#value;
  }

  static 表 = new Face("表");
  static 裏 = new Face("裏");
}

/** カード */
export class Card {
  /** @type {number} 1から13の数字 */
  #数字
  /** @type {Mark} */
  #マーク
  /** @type {Face} */
  #裏表
  constructor(数字, マーク, 裏表) {
    this.#数字 = 数字
    this.#マーク = マーク
    this.#裏表 = 裏表
  }

  get 数字() {
    return this.#数字;
  }

  get マーク() {
    return this.#マーク;
  }
  get 裏表() {
    return this.#裏表;
  }

  表にする() {
    this.#裏表 = Face.表;
  }
  裏にする() {
    this.#裏表 = Face.裏;
  }
  get が裏() {
    return this.#裏表.が裏
  }
  get が表() {
    return this.#裏表.が表
  }

  /**
   * 
   * @param {Card} 他
   * @returns 
   */
  と(他) {
    return {
      が同じ: () => this.#数字 == 他.#数字 && this.#マーク.と(他.#マーク).が同じ(),
      が同じマーク: () => this.#マーク.と(他.#マーク).が同じ() ,
      が違う色: () => this.#マーク.と(他.#マーク).が違う色()
    }
  }

  toObject() {
    return {
      数字: this.#数字,
      マーク: this.#マーク.value,
      裏表: this.#裏表.value,
    }
  }

  static fromText(text) {
    var [mark, num] = text.split("_");
    return new Card(parseInt(num), Mark.fromText(mark), Face.表);

  }
}

