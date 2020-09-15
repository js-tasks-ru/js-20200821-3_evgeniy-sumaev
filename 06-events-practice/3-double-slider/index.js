class Handler {

  constructor(slider) {
    this.slider = slider;
  }

  handleEvent(event) {
    const handler = 'on' + event.type[0].toUpperCase() + event.type.slice(1);
    this[handler](event);
  }

  onPointerdown(event) {
    event.preventDefault();
    const thumbElem = event.target;
    const { left, right } = thumbElem.getBoundingClientRect();
    this.thumbSide = thumbElem.dataset.element.replace('Thumb', '');
    const shift = {
      left: right - event.clientX,
      right: left - event.clientX,
    }
    this.shiftX = shift[this.thumbSide];

    document.addEventListener('pointermove', this);
    document.addEventListener('pointerup', this);
    this.currentThumb = thumbElem;
  }

  onPointermove(event) {
    event.preventDefault();
    const { from, progress, to } = this.slider.subElements;
    const values = this.getCurrentValues(event.clientX);

    if (this.thumbSide === 'left') {
      this.slider.selected.from = values.value;
      from.innerHTML = this.slider.formatValue(values.value);
      this.currentThumb.style.left = values.percent + '%';
      progress.style.left = values.percent + '%';
    } else {
      this.slider.selected.to = values.value;
      to.innerHTML = this.slider.formatValue(values.value);
      this.currentThumb.style.right = (100 - values.percent) + '%';
      progress.style.right = (100 - values.percent) + '%';
    }
  }

  getCurrentValues(position) {
    const { inner } = this.slider.subElements;
    const { left: innerLeft, width } = inner.getBoundingClientRect();
    const result = {};
    const { min, max } = this.slider;
    const range = max - min;

    if (this.thumbSide === 'left') {
      result.percent = (position - innerLeft + this.shiftX) / width * 100;
    } else {
      result.percent = (position - innerLeft - this.shiftX) / width * 100;
    }

    result.percent = this.checkLimit(result.percent);
    result.value = range / 100 * result.percent + min;
    result.value = Math.round(result.value);

    return result;
  }

  checkLimit(percent) {
    const left = parseFloat(this.slider.subElements.leftThumb.style.left);
    const right = 100 - parseFloat(this.slider.subElements.rightThumb.style.right);

    if (this.thumbSide === 'left') {
      if (percent >= 0 && percent <= right) {
        return percent;
      } else {
        return percent < 0 ? 0 : right;
      }
    } else {
      if (percent >= left && percent <= 100) {
        return percent;
      } else {
        return percent < left ? left : 100;
      }
    }
  }

  onPointerup() {
    document.removeEventListener('pointermove', this);
    document.removeEventListener('pointerup', this);
    this.currentThumb = null;
    this.thumbSide = '';
    this.shiftX = 0;
  }
}

export default class DoubleSlider {
  subElements = {};

  constructor({
    min = 100,
    max = 200,
    formatValue = value => '$' + value,
    selected = {
      from: min,
      to: max,
    }} = {}) {
    this.selected = selected;
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.render();
  }

  initEventListeners() {
    const handler = new Handler(this);
    this.handler = handler;
    this.subElements.leftThumb.addEventListener('pointerdown', this.handler);
    this.subElements.rightThumb.addEventListener('pointerdown', this.handler);
  }

  removeEventListeners() {
    document.removeEventListener('pointerdown', this.handler);
    document.removeEventListener('pointerdown', this.handler);
  }

  render() {
    const slider = this.createSlider();
    this.element = slider;
    this.subElements = this.getSubElements(slider);
    this.setValues();
    this.initEventListeners();
  }

  createSlider() {
    const slider = document.createElement('div');
    slider.innerHTML = this.getTemplate();

    return slider.firstElementChild;
  }

  getTemplate() {
    const { from, to } = this.selected;

    return `<div class="range-slider">
      <span data-element="from">${this.formatValue(from)}</span>
      <div data-element="inner" class="range-slider__inner">
        <span data-element="progress" class="range-slider__progress"></span>
        <span data-element="leftThumb" class="range-slider__thumb-left"></span>
        <span data-element="rightThumb" class="range-slider__thumb-right"></span>
      </div>
      <span data-element="to">${this.formatValue(to)}</span>
    </div>`;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  setValues() {
    const left = this.getValue('left');
    const right = this.getValue('right');

    this.subElements.progress.style.left = left;
    this.subElements.progress.style.right = right;
    this.subElements.leftThumb.style.left = left;
    this.subElements.rightThumb.style.right = right;
  }

  getValue(side) {
    const range = this.max - this.min;
    const valueSide = {
      left: this.selected.from - this.min,
      right: this.max - this.selected.to,
    }

    const result = valueSide[side] / range * 100;

    return Math.floor(result) + '%';
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  
  destroy() {
    this.remove();
    this.removeEventListeners();
  }
}
