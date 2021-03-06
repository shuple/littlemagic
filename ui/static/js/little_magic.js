export { LittleMagic };

class LittleMagic {
  constructor() {
    // object[layer]: array[row][col]
    this.blocks = {};

    // read from rest
    this.meta = {};

    // game state
    this.state = {
      'cg': 0,
      'confirm': false,
      'load'   : false,
      'windowWidth' : window.width,
      'windowHeigth': window.heigth
    };

    // layer alias
    this.layers = {};
    this.layerGroup = {
      'stage': [ 'layer1', 'layer2', 'layer3' ]
    };

    this.color = {
      'blank': '#000'
    };

    // static game sprite parameter
    this.imageSize = 32;
    [ this.col, this.row ] = [ 16, 14 ];
    [ this.gameWidth, this.gameHeight ] =
      [ this.col * this.imageSize, this.row * this.imageSize ];

    this.canvas = {};
    this.contexts = {};

    this.initContext();
    this.setGameSize();
  }  // constructor

  initContext() {
    for (const canvas of document.querySelectorAll('canvas')) {
      canvas.width  = this.gameWidth;
      canvas.height = this.gameHeight;
      this.canvas[canvas.id] = canvas;
      this.contexts[canvas.id] = canvas.getContext('2d');
      if (/render/.exec(canvas.id))
        this.canvas[canvas.id].style.display = 'none';
    }
  }   // initContext()

  setGameSize() {
    this.scrollWidth = this.canvas['layer0'].scrollWidth / this.col;
    this.font= { 'medium': `bold ${this.imageSize * 0.30 }px Arial` };
    this.setCanvasScale();
  }  // setGameSize()

  setCanvasScale() {
    const [ width, height ] = [ window.width, window.height ];
    if (this.state['windowWidth'] !== width && this.state['windowHeigth'] !== heigth) {
      const orientation = window.width > window.heigth ? 'landscape' : 'portrait';
      for (const canvas of document.querySelectorAll('canvas')) {
        if (orientation === 'landscape')
          canvas.style.heigth = '100%';
        else
          canvas.style.width = '100%';
      }
    }
  }  // setCanvasScale()

  timeout(content, timeout = 2) {
    if (this.state[content]) return this.state[content];
    this.state[content] = true;
    setTimeout(function(littleMagic, content) {
      littleMagic.state[content] = false;
    }, this.meta['timeout'] * timeout, this, content);
  }  // timeout

  loadScreen(on) {
    const layer = document.querySelector('canvas:last-child').id
    const context = this.contexts[layer];
    if (on) {
      context.fillStyle = this.color['blank'];
      context.fillRect(0, 0, this.gameWidth, this.gameHeight);
    } else {
      context.clearRect(0, 0, this.gameWidth, this.gameHeight);
    }
  }  // loadScreen()

  async setSpriteLayer(layers, opt = {}) {
    if (typeof layers === 'string')
      layers = layers.split(' ');
    let images = [];
    for (const layer of layers) {
      this.setLayerImage(images, layer, opt);
    }
    if (images.length > 0) {
      // draw on render
      this.clearLayer(layers, true);
      await this.drawSpriteImages(images, false);
      if (!opt['renderOnly'])
        this.showLayer(layers, true);

      // copy render to layer
      images = [];
      this.setCanvasImage(images, layers);
      await this.drawSpriteImages(images);
      if (!opt['renderOnly'])
        this.showLayer(layers);
    }
  }  // setSpriteLayer

  setLayerImage(images, layer, opt) {
    const block = this.blocks[layer];
    const imageSize = this.imageSize;
    const render = layer.replace('layer', 'render');
    for (const series of [ 'col', 'row']) {
      if (opt[series] === undefined)
        opt[series] = { 'start': 0, 'end': this[series] };
    }
    for (let row = opt['row']['start']; row < opt['row']['end']; row++) {
      for (let col = opt['col']['start']; col < opt['col']['end']; col++) {
        let src = block[row][col];
        if (src) {
          if (this.layerGroup['stage'].includes(layer))
            src = this.meta['sprite'][block[row][col]]['alpha'] || src;
          images.push({
            'src'   : this.imagesrc(src),
            'layer' : layer,
            'render': render,
            'x'     : col * imageSize,
            'y'     : row * imageSize,
            'width' : imageSize,
            'height': imageSize
          });
        }
      }
    }
  }  // setLayerImage()

  setCanvasImage(images, layers) {
    if (typeof layers === 'string')
      layers = layers.split(' ');
    const canvas = this.canvas;
    for (const layer of layers) {
      const render = layer.replace('layer', 'render');
      const src = canvas[render].toDataURL('image/png');
      images.push({
        'src'   : src,
        'layer' : render,
        'render': layer,
        'x'     : 0,
        'y'     : 0,
        'width' : this.gameWidth,
        'height': this.gameHeight
      });
    }
  }  // setCanvasImage

  drawSpriteImages(images, clear = true) {
    return new Promise((resolve, reject) => {
      const data = images.shift();
      const context = this.contexts[data['render']];
      const image = new Image();
      image.onload = () => {
        if (clear)
          context.clearRect(data['x'], data['y'], data['width'], data['height']);
        context.drawImage(image, data['x'], data['y'], data['width'], data['height']);
        if (images.length > 0)
          resolve(this.drawSpriteImages(images));
        else
          resolve();
      };
      image.src = data.src;
      image.onerror = (error) => reject(error);
    });
  }  // drawSpriteImages()

  showLayer(layers, renderLayer = false) {
    const canvas = this.canvas;
    for (const layer of layers) {
      const render = layer.replace('layer', 'render');
      if (renderLayer) {
        canvas[render].style.display = 'inline';
        canvas[layer].style.display = 'none';
      } else {
        canvas[layer].style.display = 'inline';
        canvas[render].style.display = 'none';
      }
    }
  }  // showLayer

  clearLayer(layers, renderLayer) {
    if (typeof layers === 'string')
      layers = layers.split(' ');
    for (let layer of layers) {
      if (renderLayer)
        layer = layer.replace('layer', 'render');
      this.contexts[layer].clearRect(0, 0, this.gameWidth, this.gameHeight);
    }
  }  // clearLayer

  clearContext(layer) {
    this.contexts[layer].clearRect(0, 0, this.gameWidth, this.gameHeight);
  }

  async setSpriteBlock(col, row, layer, src) {
    const blocks = this.blocks
    if (this.layerGroup['stage'].includes(layer))
      src = this.meta['sprite'][src]['alpha'] || src;
    if (src === blocks[layer][row][col] && this.state['cg'] === this.state['prev']['cg'])
      return;
    const context = this.contexts[layer];
    context.save();
    await this.drawSpriteBlock(col, row, layer, src);
    context.restore();
    blocks[layer][row][col] = src;
  }  // setSpriteBlock();

  drawSpriteBlock(col, row, layer, src) {
    return new Promise((resolve, reject) => {
      const context = this.contexts[layer];
      const imageSize = this.imageSize;
      const image = new Image();
      image.onload = () => {
        resolve(context.drawImage(image, imageSize * col, imageSize * row, imageSize, imageSize));
      };
      image.src = this.imagesrc(src);
      image.onerror = (error) => reject(error);
    });
  }  // drawSpriteBlock();

  setBlankBlock(col, row, layer) {
    const context = this.contexts[layer];
    const imageSize = this.imageSize;
    context.fillStyle = this.color['blank'];
    context.fillRect(col * imageSize, row * imageSize, imageSize, imageSize);
  }  // setBlankBlock()

  removeSpriteBlock(col, row, layer) {
    const x = col * this.imageSize;
    const y = row * this.imageSize;
    this.contexts[layer].clearRect(x, y, this.imageSize, this.imageSize);
    if (/layer\d/.exec(layer))
      this.blocks[layer][row][col] = '';
  }  // removeSpriteBlock()

  imagesrc(src) {
    return `/static/image/sprite/${this.padZero(this.state['cg'], 2)}/${src}.png`;
  } // imagesrc()

  padZero(n, k = 3) {
    return ('00' + n).slice(-k);
  }  // padZero

  async rest(url, restData, callback) {
    await fetch(url, {
      method: 'POST',
      body: JSON.stringify(restData),
      headers: { 'Content-Type': 'application/json' },
    })
    .then(response => response.json())
    .then(json => {
      callback(this, json['data']);
    })
    .catch(error => {
      console.log(error);
    });
  };  // rest()

  // rest callback

  setMeta(littleMagic, restData) {
    littleMagic.meta = restData;
  }  // setMeta
};  // class LittleMagic
