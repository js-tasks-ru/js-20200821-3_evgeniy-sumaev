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
    this.url = url;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;

    this.render();
  }

  getSearchString(baseUrl, url, params) {
    const keys = Object.keys(params);
    const paramsString = keys
      .map(key => key + '=' + params[key].toISOString())
      .join('&');

    const result = paramsString ? '?' + paramsString : '';

    return baseUrl + '/' + url + result;
  }

  getLinkStr(link) {
    return link ? `<a href="${link}" class="column-chart__link">View all</a>` : '';
  }

  getChartStr(data) {
    const maxLvl = Math.max(...data);
    const idx = this.chartHeight / maxLvl;

    return data
      .map(lvl => {
        const chartLvl = Math.floor(lvl * idx);
        const percent = Math.round(lvl / maxLvl * 100);

        return `<div style="--value: ${chartLvl}" data-tooltip="${percent}%"></div>`;
      }).join('');
      
  }

  getSum = (data) => data.reduce((acc, itm) => acc + itm, 0); 

  get renderStr() {
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
    elem.innerHTML = this.renderStr;
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
