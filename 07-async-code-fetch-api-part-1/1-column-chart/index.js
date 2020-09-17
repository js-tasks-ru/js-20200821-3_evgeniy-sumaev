import fetchJson from './utils/fetch-json.js';

const BASE_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  element;
  chartHeight = 50;

  constructor({url = '', label = '', link = '',
    range = {
      from: new Date(),
      to: new Date(),
    },
    formatHeading = data => data
  } = {}) {
    this.url = new URL(url, BASE_URL);
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
    this.loadData(this.range.from, this.range.to);
  }

  render() {
    const elem = document.createElement('div');
    elem.innerHTML = this.getRenderStr();
    this.element = elem.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  getRenderStr() {
    const renderStr = `
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLinkStr(this.link)}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header"></div>
        <div data-element="body" class="column-chart__chart">
        </div>
      </div>`;

    return `<div class='column-chart'>${renderStr}</div>`;
  }

  getLinkStr(link) {
    return link ? `<a href="${link}" class="column-chart__link">View all</a>` : '';
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements]
      .reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }
  
  async loadData(from, to) {
    this.element.classList.add('column-chart_loading');
    this.subElements.header.textContent = '';
    this.subElements.body.innerHTML = '';

    this.url.searchParams.set('from', from.toISOString());
    this.url.searchParams.set('to', to.toISOString());

    const data = await fetchJson(this.url);

    if (data && Object.values(data).length) {
      this.updateChart(data, from, to);

      this.element.classList.remove('column-chart_loading');
    }
  }

  updateChart(data, from, to) {
    this.subElements.body.innerHTML = this.getChartStr(data);
    this.subElements.header.innerHTML = this.formatHeading( this.getSum(data) );
    this.range.from = from;
    this.range.to = to;
  }

  getChartStr(data) {
    const maxLvl = Math.max(...Object.values(data));
    const idx = this.chartHeight / maxLvl;

    return Object.values(data)
      .map(lvl => {
        const chartLvl = Math.floor(lvl * idx);
        const percent = Math.round(lvl / maxLvl * 100);

        return `<div style="--value: ${chartLvl}" data-tooltip="${percent}%"></div>`;
      }).join('');
      
  }

  getSum(data) {
    return Object.values(data).reduce((acc, itm) => acc + itm);  
  }

  async update(from, to) {
    await this.loadData(from, to);
    return true;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
