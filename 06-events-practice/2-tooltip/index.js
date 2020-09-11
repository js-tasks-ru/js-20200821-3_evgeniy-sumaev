class Tooltip {

  constructor() {
    if (Tooltip.exist) {
      return Tooltip.exist;
    }

    Tooltip.exist = this;
  }

  initialize() {
    document.addEventListener('pointerover', this.onOver);
    document.addEventListener('pointerout', this.onOut);
  };

  onOver = e => {
    const tooltipElem = e.target.closest('[data-tooltip]');

    if (tooltipElem) {
      const { tooltip } = tooltipElem.dataset;
      this.render(tooltip);
      this.setPosition(e);
      document.addEventListener('pointermove', this.setPosition);
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

  onOut = () => this.remove();

  remove() {
    if (this.element) {
      document.removeEventListener('pointermove', this.onMove);
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    document.removeEventListener('pointerover', this.onOver);
    document.removeEventListener('pointerout', this.onOut);
  }
}

const tooltip = new Tooltip();

export default tooltip;
