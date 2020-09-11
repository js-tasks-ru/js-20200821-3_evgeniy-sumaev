class Tooltip {

  constructor() {
    if (Tooltip.exist) {
      return Tooltip.exist;
    }

    Tooltip.exist = this;
  }

  initialize() {
    document.addEventListener('pointerover', e => this.onOver(e));
    document.addEventListener('pointerout', () => this.onOut());
  };

  onOver(e) {
    const tooltipElem = e.target.closest('[data-tooltip]');

    if (tooltipElem) {
      const { tooltip } = tooltipElem.dataset;
      this.render(tooltip);
      this.setPosition(e);
      document.addEventListener('pointermove', e => this.onMove(e));
    }
  }

  render(text) {
    const tooltip = document.createElement('div');
    tooltip.textContent = text;
    tooltip.className = 'tooltip';
    this.element = tooltip;
    document.body.append(tooltip);
  }
  
  setPosition(e) {
    this.element.style.left = `${e.clientX + 5}px`
    this.element.style.top = `${e.clientY + 5}px`
  }

  onMove(e) {
    this.setPosition(e);
  }

  onOut() {
    this.remove();
  } 

  remove() {
    if (this.element) {
      document.removeEventListener('pointermove', this.onMove);
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}

const tooltip = new Tooltip();

export default tooltip;
