export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({data = [], label = '', value = 0, link = ''} = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.render();
  }

  getLinkStr(link) {
    let linkStr = '';
    
    if (link) {
      linkStr = `<a href="${link}" class="column-chart__link">View all</a>`;
    }

    return linkStr;
  }

  getChartStr(data) {
    const maxLvl = Math.max(...data);
    const idx = this.chartHeight / maxLvl;

    return data
      .reduce((str, lvl) => {
        const chartLvl = Math.floor(lvl * idx);
        const percent = Math.round(lvl / maxLvl * 100);

        return str + `<div style="--value: ${chartLvl}" data-tooltip="${percent}%"></div>`;
      }, '');
      
  }

  getSum = (data) => data.reduce((acc, itm) => acc + itm, 0); 

  getRenderStr() {
    const renderStr = `
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLinkStr(this.link)}
      </div>
      <div class="column-chart__container">
        <div class="column-chart__header">${this.value}</div>
        <div class="column-chart__chart">
          ${this.getChartStr(this.data)}
        </div>
      </div>`;

    return `<div class='column-chart ${this.data.length ? '' : 'column-chart_loading'}'>${renderStr}</div>`;
  }

  render() {
    const elem = document.createElement('div');
    elem.innerHTML = this.getRenderStr();
    this.element = elem.firstElementChild;
  }

  update(data) {
    if (data.length) {
      this.element.classList.remove('column-chart_loading');
    } else {
      this.element.classList.add('column-chart_loading');
    }
    
    this.element
      .querySelector('.column-chart__chart')
      .innerHTML = this.getChartStr(data);

    this.element
      .querySelector('.column-chart__header')
      .innerHTML = this.getSum(data);
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // additionally needed to remove all listeners...
  }
}
