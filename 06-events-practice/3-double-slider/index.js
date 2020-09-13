class Worker {

  constructor(slider) {
      if (Worker.exist) {
        Worker.exist.initValues(slider);  
        return Worker.exist;
      }
      Worker.exist = this;
      this.initValues(slider);
  }

  initValues(slider) {
    this.slider = slider;
  }

  handleEvent(event) {
      this[event.type](event);
  }

  mousedown(event) {
      const thumbElem = event.target.closest('[class^="range-slider__thumb"]');
      
      if(thumbElem) {
        this.startPosition = event.clientX;
        this.startOffsetX = event.offsetX;
        this.currentThumb = thumbElem;
        this.minPercent = this.slider.minPercent;
        this.maxPercent = this.slider.maxPercent;
      }
  }

  mousemove(event) {
    const { minValue: minValueElem, maxValue: maxValueElem, progress: progressElem } = this.slider.subElements;
    const { valueFrom, valueTo, minPercent, maxPercent, formatValue } = this.slider;

    function getPercent(width, side) {
      const leftStartPosition = this.startPosition - this.startOffsetX;
      const rightStartPosition = this.startPosition + this.currentThumb.offsetWidth - this.startOffsetX;
      const sideOptions = {
        leftShiftPercent: (event.clientX - leftStartPosition) / width * 100,
        rightShiftPercent: (event.clientX - rightStartPosition) / width * 100 * (-1),
        leftPercent: this.minPercent,
        rightPercent: this.maxPercent,
      }
      const result = sideOptions[`${side}Percent`] + sideOptions[`${side}ShiftPercent`];

      return Math.round(checkLimits(side, result));
    }
      
    function checkLimits(side, result) {
      const maxLeft = 100 - maxPercent;
      const maxRight = 100 - minPercent;

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

    function getValue(percent, side) {
      const normalPercent = side === 'left' ? percent : 100 - percent;
      const result = valueFrom + (valueTo - valueFrom) / 100 * normalPercent;

      return Math.round(result);
    }

    if (this.currentThumb) {
      const progressBase = this.currentThumb.offsetParent;
      const side = this.currentThumb.className.replace('range-slider__thumb-', '');
      const currentPercent = getPercent.call(this, progressBase.offsetWidth, side);
      const value = getValue(currentPercent, side);

      if (side === 'left') {
        minValueElem.textContent = formatValue(value);
        this.slider.minPercent = currentPercent;
      } else if (side === 'right') {
        maxValueElem.textContent = formatValue(value);
        this.slider.maxPercent = currentPercent;
      }

      this.currentThumb.style[side] = currentPercent + '%';
      progressElem.style[side] = currentPercent + '%';
    }
  }

  mouseup() {
    if (this.currentThumb) {
      this.currentThumb = null;
      this.startPosition = 0;
      this.startOffsetX = 0;
      this.minPercent = 0;
      this.maxPercent = 0;
    }
  }
}

export default class DoubleSlider {
  subElements = {};

  constructor({min = 100, max = 200,
      formatValue = value => '$' + value,
      selected: { from = 120, to = 150 }
    } = { selected: {} }) {
    this.valueFrom = min;
    this.valueTo = max;
    this.minPercent = Math.round((from - min) / (max - min) * 100);
    this.maxPercent = 100 - Math.round((to - min) / (max - min) * 100);
    this.currentMinValue = this.getValue('left');
    this.currentMaxValue = this.getValue('right');
    this.formatValue = formatValue;
    console.log(this);
    this.render();
    this.initEventListeners();
  }

  initEventListeners() {
    ['mousedown', 'mousemove', 'mouseup']
      .forEach(event => document.addEventListener(event, new Worker(this)));
  }
  
  render() {
    this.subElements.minValue = this.createValueElem('left');
    this.subElements.maxValue = this.createValueElem('right');
    this.subElements.progress = this.createProgressElem();
    this.subElements.leftThumb = this.createThumbElem(this.minPercent, 'left');
    this.subElements.rightThumb = this.createThumbElem(this.maxPercent, 'right');

    const wrap = this.createWrapElem();
    wrap.append(this.subElements.progress);
    wrap.append(this.subElements.leftThumb);
    wrap.append(this.subElements.rightThumb);

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

  createValueElem(side) {
    const sideOptions = {
      left: this.currentMinValue,
      right: this.currentMaxValue,
    }
    const valueElem = document.createElement('span');
    const value = this.formatValue(sideOptions[side]);
    valueElem.innerHTML = `<span>${value}</span>`;

    return valueElem;
  }

  getValue(side) {
    const normalPercent = side === 'left' ? this.minPercent : 100 - this.maxPercent;
    const result = this.valueFrom + (this.valueTo - this.valueFrom) / 100 * normalPercent;

    return Math.round(result);
  }

  createWrapElem() {
    const wrapElem = document.createElement('div');
    wrapElem.classList.add('range-slider__inner');

    return wrapElem;
  }

  createProgressElem() {
    const progressElem = document.createElement('span');
    progressElem.classList.add('range-slider__progress');
    progressElem.style = `left: ${this.minPercent}%; right: ${this.maxPercent}%`;

    return progressElem;
  }

  createThumbElem(value, side) {
    const thumbElem = document.createElement('span');
    thumbElem.classList.add(`range-slider__thumb-${side}`);
    thumbElem.style = `${side}: ${value}%`;

    return thumbElem;
  }
}
