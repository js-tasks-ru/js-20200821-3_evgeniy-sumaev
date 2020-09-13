class Worker {

  constructor() {
      if (Worker.exist) {
          return Worker.exist;
      }
      Worker.exist = this;
      this.leftPercent = 0;
      this.rightPercent = 0;
  }

  handleEvent(event) {
      this[event.type](event);
  }

  mousedown(event) {
      const thumbElem = event.target.closest('[class^="range-slider__thumb"]');
      
      if(thumbElem) {
        this.startPosition = event.clientX;
        this.startOffsetX = event.offsetX;
        this.leftPercent = parseInt(thumbElem.style.left);
        this.rightPercent = parseInt(thumbElem.style.right);
        this.currentElem = thumbElem;
      }
  }

  mousemove(event) {
      function getPercent(side) {
        const progressBase = this.currentElem.offsetParent;
        const startPosition = {
          left: this.startPosition - this.startOffsetX,
          right: this.startPosition + this.currentElem.offsetWidth - this.startOffsetX,
        }
        const shiftPercent = (event.clientX - startPosition[side]) / progressBase.offsetWidth * 100;
        const sideIdx = side === 'left' ? 1 : -1;
        const result = this[`${side}Percent`] + shiftPercent * sideIdx;

        return Math.round(checkLimits.call(this, side, result));
      }
      
      function checkLimits(side, result) {
        const maxLeft = 100 - parseInt(this.progressElem.style.right);
        const maxRight = 100 - parseInt(this.progressElem.style.left);

        if (side === 'left') {
          if (result >= 0 && result <= maxLeft) {
            return result;
          } else {
            return result < 0 ? 0: maxLeft;
          }
        } else if (side === 'right') {
          if (result <= maxRight && result >= 0) {
            return result;
          } else {
            return result > maxRight ? maxRight : 0;
          }
        }
      }

      if (this.currentElem) {
        this.progressElem = this.currentElem.parentNode.querySelector('.range-slider__progress');
        const side = this.currentElem.className.replace('range-slider__thumb-', '');
        this.currentElem.style[side] = getPercent.call(this, side) + '%';
        this.progressElem.style[side] = getPercent.call(this, side) + '%';
      }
  }

  mouseup() {
    if (this.currentElem) {
      this.currentElem = null;
      this.currentOffsetX = 0;
      this.startPosition = 0;
      this.startOffsetX = 0;
      this.leftPercent = parseInt(this.progressElem.style.left);
      this.rightPercent = parseInt(this.progressElem.style.right);
      this.progressElem = null;
      console.log(this.leftPercent);
      console.log(this.rightPercent);
    }
  }
}

export default class DoubleSlider {
  subElements = {};

  constructor() {
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    ['mousedown', 'mousemove', 'mouseup']
      .forEach(event => document.addEventListener(event, new Worker()));
  }
  
  render(min = 0, max = 100, minPercent = 10, maxPercent = 35) {
    this.subElements.minValue = this.createValueElem(min);
    this.subElements.maxValue = this.createValueElem(max);
    this.subElements.progress = this.createProgressElem(minPercent, maxPercent);
    this.subElements.minThumb = this.createThumbElem('left', minPercent);
    this.subElements.maxThumb = this.createThumbElem('right', maxPercent);

    const wrap = this.createWrapElem();
    wrap.append(this.subElements.progress);
    wrap.append(this.subElements.minThumb);
    wrap.append(this.subElements.maxThumb);

    const slider = this.createSlider();
    slider.append(this.subElements.minValue);
    slider.append(wrap);
    slider.append(this.subElements.maxValue);

    this.element = slider;
  }

  createSlider() {
    const slider = document.createElement('div');
    slider.classList.add('range-slider');

    return slider;
  }

  createValueElem(value) {
    const valueElem = document.createElement('span');
    valueElem.innerHTML = `<span>$${value}</span>`;

    return valueElem;
  }

  createWrapElem() {
    const wrapElem = document.createElement('div');
    wrapElem.classList.add('range-slider__inner');

    return wrapElem;
  }

  createProgressElem(minPercent, maxPercent) {
    const progressElem = document.createElement('span');
    progressElem.classList.add('range-slider__progress');
    progressElem.style = `left: ${minPercent}%; right: ${maxPercent}%`;

    return progressElem;
  }

  createThumbElem(side, value) {
    const thumbElem = document.createElement('span');
    thumbElem.classList.add(`range-slider__thumb-${side}`);
    thumbElem.style = `${side}: ${value}%`;

    return thumbElem;
  }
}
