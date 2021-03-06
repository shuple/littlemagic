import { LittleMagic } from './little_magic.js';
export { LittleMagicMake }

String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const ch = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + ch;
    hash |= 0; // convert to 32bit integer
  }
  return hash;
};  // String.prototype.hashCode()

String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

class LittleMagicMake extends LittleMagic {
  constructor() {
    super();

    // initial load
    this.loadScreen(true);

    this.state = Object.assign(this.state, {
      'prev' : { 'layer': 'layer1', 'cg': this.state['cg'] },
      'item' : '',
      'col'  : 0,
      'row'  : 0,
      'layer': 'layer1',
      'block': 0,
      'stage': 1,
      'hash' : ''
    });

    // layer alias
    this.layers  = Object.assign(this.layers, {
      'menu'  : 'layer5',
      'fill'  : 'layer6',
      'system': 'layer7'
    });

    this.color  = Object.assign(this.color, {
      'menu'  : '#fff',
      'system': '#222'
    });

    this.layerGroup = Object.assign(this.layerGroup, {
      'system': [ this.layers['fill'], this.layers['system'] ],
      'make'  : [ 'layer1', 'layer2', 'layer3', this.layers['system'] ]
    });
  }  // constructor()

  async menuContext() {
    for (let content of Object.keys(this.meta['position'])) {
      const position = this.meta['position'][content];
      // text
      this.setMenuDesc(position['col'] + 1,  position['row'], content);
      // sprite
      await this.setMenuSprite(position['col'], position['row'], content);
      // text on sprite
      this.setMenuSpriteText(position['col'], position['row'], content);
    }
  }  // menuContext()

  setMenuDesc(col, row, text) {
    text = text.length > 2 ? text.capitalizeFirstLetter() : text.toUpperCase();
    const imageSize = this.imageSize;
    const [ x, y ] = [ imageSize * col, imageSize * row ];
    const context = this.menuContextText();
    context.textAlign = 'start';
    context.textBaseline = 'middle'
    context.fillText(text, x + 2, y + imageSize / 2);
  }  // setMenuDesc

  menuContextText() {
    const context = this.contexts[this.layers['menu']];
    context.font = this.font['medium'];
    context.fillStyle = this.color['menu'];
    return context;
  }  // menuContextText()

  async setMenuSprite(col, row, content) {
    const context = this.contexts[this.layers['menu']];
    const imageSize = this.imageSize;
    context.fillStyle = this.color['blank'];
      switch (content) {
        case 'item' :
        case 'stage':
          context.fillStyle = this.color['blank'];
          context.fillRect(col * imageSize, row * imageSize, imageSize, imageSize);
          break;
        case 'block':
          await this.setMenuBlockIcon();
          break;
        case 'fill':
        case 'cg'  :
        case 'new' :
        case 'save':
          await this.setMenuIcon(content);
          break;
      }
  }  // setMenuSprite

  setMenuSpriteText(col, row, content) {
    const imageSize = this.imageSize;
    const context = this.contexts[this.layers['menu']];
    context.fillStyle = this.color['blank'];
    switch (content) {
    case 'stage':
      const stage = this.state['stage'] ? this.padZero(this.state['stage']) : 'new';
      context.fillRect(col * imageSize, row * imageSize, imageSize, imageSize);
      this.setMenuSpriteDesc(col, row, stage);
      break;
    }
  }  // setMenuSpriteText()

  setMenuSpriteDesc(col, row, text) {
    const imageSize = this.imageSize;
    const [ x, y ] = [ imageSize * col , imageSize * row ];
    const context = this.menuContextText();
    context.textAlign = 'center';
    context.textBaseline = 'middle'
    context.fillText(text, x + imageSize / 2, y + imageSize / 2);
  }  // setMenuDesc

  setMenuReplyText(col, row, text) {
    const imageSize = this.imageSize
    const [ x, y ] = [ imageSize * col + (imageSize / 8), imageSize * (row + 1.4) ];
    const context = this.menuContextText();
    context.textAlign = 'start';
    context.textBaseline = 'alphabetic';
    context.clearRect(imageSize * col, imageSize * (row + 1), imageSize * 2, imageSize);
    context.fillText(text, x, y);
    setTimeout(function(imageSize, col, row) {
      context.clearRect(imageSize * col, imageSize * (row + 1), imageSize * 2, imageSize);
    }, this.meta['timeout'] * 20, imageSize, col, row);
  }  // setMenuReplyText

  setMenuStageText(text) {
    const imageSize = this.imageSize;
    const [ col, row ] = [ this.meta['position']['stage']['col'], this.meta['position']['stage']['row'] ];
    const context = this.contexts[this.layers['menu']];
    context.fillStyle = this.color['blank'];
    context.fillRect(col * imageSize, row * imageSize, imageSize, imageSize);
    this.setMenuSpriteDesc(col, row, this.padZero(text, 3));
  }  // setMenuStage

  systemContext() {
    const layer = this.layers['fill'];
    const position = this.meta['positionRange']['itembox'];
    const [ x, y ] = [ this.imageSize * position['start']['col'], 0 ];
    const width = this.gameWidth - this.imageSize *
      (position['end']['col'] - position['start']['col'] + 1);
    const height = this.gameHeight - this.imageSize * (position['end']['row'] - 1);
    const itemboxStart = position['start'];
    const itemboxEnd = position['end'];
    const context = this.contexts[layer];
    context.fillStyle = this.color['system'];
    context.fillRect( x, y, width, height);
  }  // systemContext()

  mouseDebug() {
    if (this.meta['debug']['mouseDebug']) {
      const imageSize = this.imageSize
      const [ x, y ] = [ (imageSize * (this.col - 2)) + (imageSize / 8), imageSize * 0.6 ];
      const context = this.contexts[this.layers['menu']];
      context.font = this.font['medium'];
      context.textAlign = 'start';
      context.textBaseline = 'alphabetic';
      context.fillStyle = this.color['menu'];
      const contents = [ 'X', 'Y', 'COL', 'ROW', 'CTX' ];
      for (let i = 0; i < contents.length; i++) {
        context.fillText(contents[i] , x, y * (i + 1));
      }
    }
  }  // mouseDebug()

  mouseDebugStatus(xAxis, yAxis, col, row) {
    if (this.meta['debug']['mouseDebug']) {
      const imageSize = this.imageSize
      const [ x, y ] = [  imageSize * 15, imageSize * 0.6 ];
      const ctx = /(\d)/.exec(this.state['layer'])[1];
      const context = this.contexts[this.layers['menu']];
      context.textAlign = 'start';
      context.textBaseline = 'alphabetic';
      context.clearRect(x, 0, imageSize, imageSize * 4);
      context.fillStyle = this.color['menu'];
      const contents = [ xAxis, yAxis, col, row, ctx ];
      for (let i = 0; i < contents.length; i++) {
        context.fillText(`: ${contents[i]}`, x, y * (i + 1));
      }
    }
  }  // mouseDebugStatus()

  mouseEvent(canvas, event, pressHold) {
    const [x, y] = this.mousePosition(canvas, event);
    const [ col, row ] = this.mousePositionToIndex(x, y);
    if (pressHold) {
      this.pressHold(col, row);
    } else {
      this.click(col, row, event);
    }
    this.mouseDebugStatus(x, y, col, row);
  }  // mouseEvent

  mousePosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    return [ parseInt(event.clientX - rect.left), parseInt(event.clientY - rect.top) ]
  }  // mousePosition()

  mousePositionToIndex(x, y) {
    let [ col, row ] = [ parseInt(x / this.scrollWidth), parseInt(y / this.scrollWidth) ];
    if (isNaN(col)) col = 0;
    if (isNaN(row)) row = 0;
    return [ col, row ];
  }  // mousePositionToIndex

  click(col, row, event) {
    switch (this.state['layer']) {
    case 'layer1':
    case 'layer2':
    case 'layer3':
      if (this.areaRange(col, row, 'stage')) {
        if (event.altKey) {
          this.state['item'] = this.itemOnStageBlock(col, row);
          if (this.state['item'])
            this.state['layer'] = this.itemLayer(this.state['item']);
        } else if (this.state['item']) {
          const layer = this.itemLayer(this.state['item']);
          const src = this.rotateItem(col, row, layer, this.state['item']);
          this.state['item'] = src;
          this.state['layer'] = this.itemLayer(src);
          this.setSpriteBlock(col, row, layer, src);
        }
      } else if (this.areaBlock(col, row, 'item')) {
        this.selectMenuItembox();
      } else if (this.areaBlock(col, row, 'block')) {
        this.selectMenuBlock(col, row, 1);
      } else if (this.areaBlock(col, row, 'cg')) {
        this.selectMenuCG(col, row, 1);
      } else if (this.areaBlock(col, row, 'stage')) {
        this.selectMenuStage(col, row, 1);
      }
      break;
    case this.layers['system']:
      if (this.areaRange(col, row, 'itembox')) {
        this.selectSystemItembox(col, row);
      } else if (this.areaRange(col, row, 'stage')) {
        this.closeSystemItembox(this.state['prev']['layer']);
      } else if (this.areaBlock(col, row, 'item')) {
        this.closeSystemItembox(this.state['prev']['layer']);
      } else if (this.areaBlock(col, row, 'block')) {
        this.selectMenuBlock(col, row, 1);
      } else if (this.areaBlock(col, row, 'cg')) {
        this.selectMenuCG(col, row, 1);
      } else if (this.areaBlock(col, row, 'stage')) {
        this.selectMenuStage(col, row, 1);
      } else if (this.areaRange(col, row, 'menu')) {
        this.closeSystemItembox(this.state['prev']['layer']);
      }
      break;
    }
  }  // click()

  pressHold(col, row) {
    switch (this.state['layer']) {
    case 'layer1':
    case 'layer2':
    case 'layer3':
      if (this.areaRange(col, row, 'stage')) {
        this.state['layer'] = this.activeLayer(col, row);
        this.removeSpriteBlock(col, row, this.state['layer']);
        this.rotateItemReset();
      } else if (this.areaBlock(col, row, 'item')) {
        this.setBlankBlock(col, row, this.layers['menu']);
        this.state['item'] = ''
      } else if (this.areaBlock(col, row, 'fill')) {
        this.selectMenuFill();
      } else if (this.areaBlock(col, row, 'block')) {
        this.selectMenuBlock(col, row, -1);
      } else if (this.areaBlock(col, row, 'cg')) {
        this.selectMenuCG(col, row, -1);
      } else if (this.areaBlock(col, row, 'new')) {
        this.selectMenuNew();
      } else if (this.areaBlock(col, row, 'save')) {
        this.selectMenuSave();
      } else if (this.areaBlock(col, row, 'stage')) {
        this.selectMenuStage(col, row, -1);
      }
      break;
    case this.layers['system']:
      if (this.areaBlock(col, row, 'fill')) {
        this.selectMenuFill();
      } else if (this.areaRange(col, row, 'stage')) {
        this.closeSystemItembox(this.state['prev']['layer']);
      } else if (this.areaBlock(col, row, 'item')) {
        this.setBlankBlock(col, row, this.layers['menu']);
        this.state['item'] = ''
        this.closeSystemItembox(this.state['prev']['layer']);
      } else if (this.areaBlock(col, row, 'block')) {
        this.selectMenuBlock(col, row, -1);
      } else if (this.areaBlock(col, row, 'cg')) {
        this.selectMenuCG(col, row, -1);
      } else if (this.areaBlock(col, row, 'stage')) {
        this.selectMenuStage(col, row, -1);
      } else if (this.areaRange(col, row, 'menu')) {
        this.closeSystemItembox(this.state['prev']['layer']);
      }
      break;
    default:
    }
  }  // pressHold()

  areaRange(col, row, content) {
      const position = this.meta['positionRange'][content];
      const start = position['start'];
      const end = position['end'];
      return (col >= start['col'] && col <= end['col'] && row >= start['row'] && row <= end['row']);
  }  // areaRange()

  areaBlock(col, row, content) {
    const position = this.meta['position'][content];
    return (col === position['col'] && row === position['row']);
  }  // areaBlock()

  itemLayer(item) {
    const layer = /^(layer\d)/.exec(item);
    return layer[0];
  }  // itemLayer()

  activeLayer(col, row) {
    for (const layer of [ ...this.layerGroup['stage'] ].reverse()) {
      if (this.blocks[layer][row][col]) return layer;
    }
    return this.state['layer'];
  }  // activeBlock()

  selectMenuItembox() {
    const layer = this.layers['system'];
    this.state['layer'] = layer;
    this.canvas[this.layers['fill']].style.display = 'inline';
    this.canvas[layer].style.display = 'inline';
  }  // selectMenuItembox()

  async setMenuBlockIcon(block) {
    // find block src from layer1
    if (block === undefined) {
      const src = this.findStageBlock('layer1');
      block = parseInt(/\/block\/(\d{2})/.exec(src)[1]);
      this.state['block'] = parseInt(block);
    }
    // set block on menu
    block = this.padZero(block, 2);
    const position = this.meta['position'];
    const [ col, row ] = [ position['block']['col'], position['block']['row'] ];
    await this.setSpriteBlock(col, row, this.layers['menu'], `layer1/block/${block}/field/00`);
  }  // setMenuBlockIcon()

  findStageBlock(layer) {
    for (let row = 0; row < this.row; row++) {
      for (let col = 1; col < this.col - 2; col++) {
        const src = this.blocks[layer][row][col];
        if (/\/block/.exec(src)) return src;
      }
    }

    // default block
    return 'layer1/block/00/field/00';
  }  // findStageBlock()

  async setMenuIcon(content) {
    const src = `layer0/${content}/00`;
    const position = this.meta['position'][content];
    await this.setSpriteBlock(position['col'], position['row'], this.layers['menu'], src);
  }  // setMenuIcon()

  selectSystemItembox(col, row) {
    this.state['item'] = this.blocks[this.layers['system']][row][col]
    if (this.state['item']) {
      const layer = /^(layer\d)/.exec(this.state['item']);
      const position = this.meta['position']['item'];
      this.setSpriteBlock(position['col'], position['row'], this.layers['menu'], this.state['item']);
      [ this.state['layer'], this.state['prev']['layer'] ] = [ layer[1], layer[1] ];
      this.closeSystemItembox();
    }
  }  // selectSystemItembox()

  closeSystemItembox(layer) {
    if (layer) this.state['layer'] = layer;
    for (const layer of this.layerGroup['system']) {
      this.canvas[layer].style.display = 'none';
    }
  }  // closeSystemItembox()

  selectMenuCG(col, row, next) {
    // prevent click bashing
    if (this.timeout('load')) return;
    const cg = this.state['cg'] + next;
    this.state['prev']['cg'] = this.state['cg'];
    this.state['cg'] = cg < 0 ? this.meta['lastCG'] : cg % (this.meta['lastCG'] + 1);

    // update sprite
    this.setSpriteLayer(this.layerGroup['stage']);
    this.setSpriteLayer(this.layers['system'],
      { 'renderOnly': this.state['layer'] != this.layers['system'] });
    this.setSpriteBlock(col, row, this.layers['menu'], 'layer0/cg/00');
    let position = this.meta['position']['block'];
    const src = `layer1/block/${this.padZero(this.state['block'], 2)}/field/00`;
    this.setSpriteBlock(position['col'], position['row'], this.layers['menu'], src);
    if (this.state['item']) {
      position = this.meta['position']['item']
      this.setSpriteBlock(position['col'], position['row'], this.layers['menu'], this.state['item']);
    }
  }  // selectMenuCG()

  selectMenuFill() {
    if (this.state['item'] === '' && this.state['layer'] === '') return;
    const item = this.state['item'];
    const layer = item === '' ? this.state['layer'] : this.itemLayer(item);
    for (let row = 1; row < this.row - 1; row++) {
      for (let col = 2; col < this.col - 3; col++) {
        this.blocks[layer][row][col] = item;
      }
    }
    this.setSpriteLayer(layer);
  }  // selectMenuFill()

  selectMenuBlock(col, row, next) {
    // prevent click bashing
    if (this.timeout('load')) return;
    let block = this.state['block'] + next;
    block = block < 0 ? this.meta['lastBlock'] : block % (this.meta['lastBlock'] + 1);
    this.state['block'] = block;
    const src = `layer1/block/${this.padZero(block, 2)}/field/00`;

    // update sprite
    this.setSpriteBlock(col, row, this.layers['menu'], src);
    this.updateBlock(this.layerGroup['make'], block);
    this.setSpriteLayer(this.layerGroup['stage']);
    this.updateMenuItem(block);
    this.updateSystemItembox(block);
  }  // selectMenuBlock()

  updateBlock(layers, newBlock) {
    if (typeof layers == 'string')
      layers = layers.split(' ');
    for (const layer of layers) {
      const block = this.blocks[layer];
      for (let row =  0; row < this.row; row++) {
        for (let col = 0; col < this.col; col++) {
          const src = block[row][col];
          const match = /\/(block\/\d)/.exec(src);
          if (match)
            block[row][col] = src.replace(/block\/\d{2}/, `${match[1]}${newBlock}`);
        }
      }
    }
  }  // updateBlock()

  selectMenuStage(col, row, next) {
    // require confirm to discards the stage changes
    const position = this.meta['position']['stage'];
    if (this.state['hash'] != this.stageHash() && this.state['confirm'] === false) {
      this.setMenuReplyText(col, row, 'Tap Again');
      this.timeout('confirm', 20);
    } else {
      // prevent click bashing
      if (this.timeout('load')) return;
      const imageSize = this.imageSize;
      const context = this.contexts[this.layers['menu']];
      context.clearRect(imageSize * col, imageSize * (row + 1), imageSize * 2, imageSize);
      const restData = {
        'cg'   : this.state['cg'],
        'stage': this.state['stage'],
        'next' : next
      };
      this.rest('/post/stage', restData, this.nextStage);
    }
  }  // selectMenuStage()

  selectMenuNew() {
    if (this.state['stage'] === '' && this.state['hash'] === this.stageHash()) return;
    this.state['stage'] = 0;
    const restData = {
      'cg'  : this.state['cg'],
      'file': [ 'stage/new' ],
    };
    this.rest('/post/read', restData, this.loadStage);
  }  // selectMenuNew()

  selectMenuSave() {
    // disable save in demo mode
    if (this.meta['demo']) {
      console.log('Demo mode!!');
      const position = this.meta['position']['save'];
      this.setMenuReplyText(position['col'], position['row'], `Demo mode`);
      return;
    }
    if (this.state['hash'] === this.stageHash()) {
      const position = this.meta['position']['save'];
      this.setMenuReplyText(position['col'], position['row'], 'No\nChanges');
      return;
    }
    let stageBlocks = {};
    for (const layer of this.layerGroup['stage']) {
      stageBlocks[layer] = this.blocks[layer];
    }
    const restData = {
      'content': 'stage',
      'cg'     : this.state['cg'],
      'stage'  : this.state['stage'],
      'blocks' : stageBlocks
    };
    this.rest('/post/write', restData , this.saveStage);
  }  // selectMenuSave()

  stageHash() {
    let stages = [];
    for (const stage of this.layerGroup['stage']) {
      stages.push(this.blocks[stage]);
    }
    return JSON.stringify(stages).hashCode();
  }  // stageHash()

  itemOnStageBlock(col ,row) {
    let src = '';
    for (const layer of [ ...this.layerGroup['stage'] ].reverse()) {
      if (this.blocks[layer][row][col]) {
        src = this.blocks[layer][row][col].replace('_alpha', '');
        const position = this.meta['position']['item'];
        this.setSpriteBlock(position['col'], position['row'], this.layers['menu'], src);
        break;
      }
    }
    return src;
  }  // itemOnStageBlock()

  rotateItem(col, row, layer, src) {
    const sprite = this.meta['sprite'];
    return this.blocks[layer][row][col] === src && 'rotateItem' in sprite[src] ?
      sprite[src]['rotateItem'] : src;
  }  // rotateItem

  rotateItemReset() {
    if (this.state['item'] && 'rotateItem' in this.meta['sprite'][this.state['item']]) {
      const position = this.meta['position'];
      const [ col, row ] = [ position['item']['col'], position['item']['row'] ];
      this.state['item'] = this.blocks[this.layers['menu']][row][col]
    }
  }  // rotateItemReset()

  nextBlock(src, block) {
    const match = /\/(block\/\d)/.exec(src);
    return match ? src.replace(/block\/\d{2}/, `${match[1]}${block}`) : '';
  }  // nextBlock()

  updateMenuItem(nextBlock) {
    const layer = this.layers['menu'];
    const block = this.blocks[layer];
    const position = this.meta['position'];
    const [ col, row ] = [ position['item']['col'], position['item']['row'] ];
    const src = this.nextBlock(block[row][col], nextBlock);
    if (src) {
      const context = this.contexts[layer];
      context.fillStyle = this.color['blank'];
      context.fillRect(this.imageSize * col, this.imageSize * row, this.imageSize, this.imageSize);
      this.state['item'] = src;
      this.setSpriteBlock(col, row, layer, src);
    }
  }  // updateMenuItem()

  updateSystemItembox(nextBlock) {
    const position = this.meta['positionRange']['itembox'];
    let opt = {
      'col': {
        'start': position['start']['col'],
        'end'  : position['end']['col'],
      },
      'row': {
        'start': position['start']['row'],
        'end'  : position['end']['row'],
      },
      'renderOnly': this.state['layer'] !== this.layers['system']
    };
    this.updateBlock(this.layers['system'], nextBlock);
    this.setSpriteLayer(this.layers['system'], opt);
  }  // updateSystemItembox()

  // rest callback

  async setGame(littleMagic, restData) {
    const layers = Object.keys(restData);
    littleMagic.blocks = restData;
    littleMagic.state['hash'] = littleMagic.stageHash();
    await littleMagic.setSpriteLayer(layers);
    await littleMagic.menuContext();
    littleMagic.systemContext();

    // debug option
    littleMagic.mouseDebug();

    // hide system layer
    for (const layer of littleMagic.layerGroup['system']) {
      littleMagic.canvas[layer].style.display = 'none';
    }

    // show game screen
    littleMagic.loadScreen(false);
  }  // setGame()

  async loadStage(littleMagic, restData) {
    const layers = Object.keys(restData);
    littleMagic.blocks = Object.assign(littleMagic.blocks, restData);

    // block change
    const block = littleMagic.state['block'];
    littleMagic.state['block'] = parseInt(/block\/(\d{2})/.exec(littleMagic.findStageBlock('layer1'))[1]);

    // new stage
    if (littleMagic.state['stage'] === 0) {
      if (littleMagic.state['block'] != block) {
        const updateLayers = littleMagic.layerGroup['stage']
        updateLayers.concat(layers);
        littleMagic.state['block'] = block;
        littleMagic.updateBlock(updateLayers, block);
      }
    }

    // calculate new hash
    littleMagic.state['hash'] = littleMagic.stageHash();

    // update sprite
    littleMagic.setSpriteLayer(layers, { 'renderOnly': true });
    littleMagic.setMenuBlockIcon(littleMagic.state['block']);
    littleMagic.showLayer(littleMagic.layerGroup['stage']);
    if (littleMagic.state['stage'] != 0 && littleMagic.state['block'] != block) {
      littleMagic.updateMenuItem(this.state['block']);
      littleMagic.updateSystemItembox(littleMagic.state['block']);
    }

    // update stage number
    const position = littleMagic.meta['position']['stage'];
    littleMagic.setMenuSpriteText(position['col'], position['row'], 'stage');
  }  // loadStage()

  nextStage(littleMagic, restData) {
    littleMagic.state['stage'] = restData['stage'];
    littleMagic.setMenuStageText(restData['stage']);
    littleMagic.loadStage(littleMagic, restData['blocks']);
  }  // nextStage()

  saveStage(littleMagic, restData) {
    const imageSize = littleMagic.imageSize;
    const position = littleMagic.meta['position']['save'];
    const stage = littleMagic.padZero(restData['stage']);
    littleMagic.setMenuReplyText(position['col'], position['row'], `Saved ${stage}!!`);
    littleMagic.setMenuStageText(restData['stage']);
    // save state
    littleMagic.state['stage'] = restData['stage'];
    littleMagic.state['hash'] = littleMagic.stageHash();
  }  // saveStage()
}  // class LittleMagicMake
