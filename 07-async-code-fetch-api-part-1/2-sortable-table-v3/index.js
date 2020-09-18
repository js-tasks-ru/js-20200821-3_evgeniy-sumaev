import fetchJson from './utils/fetch-json.js';

const BASE_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  constructor(header = [], {
    url = '',
    sorted = {
      id: header.find(item => item.sortable).id,
      sortType: header.find(item => item.sortable).sortType,
      order: 'asc',
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step
  } = {}) {
    this.header = header;
    this.url = new URL(url, BASE_URL);
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.step = step;
    this.start = start;
    this.end = end;

    this.render();
  }
  
  async render() {
    const { id, order } = this.sorted;
    const elementWrap = document.createElement('div');
    elementWrap.innerHTML = this.getTableStr();
    this.element = elementWrap.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    this.data = await this.loadData(id, order, this.start, this.end);
    this.updateTable(this.data);
    this.initEventListeners();
  }

  getTableStr() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody(this.data)}
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          No products
        </div>
      </div>`;
  }
    
  getTableHeader() {
    return (`
      <div class='sortable-table__header sortable-table__row' data-element='header'>
        ${this.getHeaderRow()}
      </div>
    `)
  }

  getHeaderRow() {
    return (
      `${this.header.map(({id, title, sortable, sortType}) => {
        const order = sortable ? 'asc' : '';
          return (
            `<div class="sortable-table__cell" data-sortType="${sortType}" data-id="${id}" data-sortable="${sortable}" data-order=${order}>
              <span>${title}</span>
              ${this.getArrowStr(id)}
            </div>`
          )
        }).join('')}`
    )
  }

  getArrowStr(id) {
    const thisSorted = this.sorted.id === id;
    if (thisSorted) {
      return (
        `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      )
    }
    return ''
  }

  getTableBody(data) {
    return (`
      <div class='sortable-table__body' data-element='body'>
        ${this.getBodyStr(this.header, data)}
      </div>
    `)
  }

  getBodyStr(header, data) {
    return `${data.map(tableRowItem => this.getBodyRow(header, tableRowItem)).join('')}`;
  }

  getBodyRow(header, tableRowItem) {
    return (
      `<div class="sortable-table__row">
        ${header.map(({id}) => {
          if (id === 'images') {
            return `<div class=sortable-table__cell>
                      <img class="sortable-table-image" alt="Image" src="${tableRowItem.images[0]?.url}">
                    </div>`;
          } else {
            return `<div class=sortable-table__cell>${tableRowItem[id]}</div>`;
          }
        }).join('')}
      </div>`
    );
  }
  
  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements]
      .reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    let data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table_loading');

    return data;
  }

  updateTable(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getTableBody(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  onClickSort = event => {
    const nextOrder = order => {
      switch (order) {
        case 'asc':
          return 'desc';
        case 'desc':
          return 'asc';
        default:
          return 'asc';
      }
    }

    const column = event.target.closest('[data-sortable="true"]');
    if (column) {
      const { id, order, sorttype } = column.dataset;
      const currentOrder = nextOrder(order);

      this.sorted = {
        id,
        order: currentOrder,
        sorttype: sorttype,
      };

      if (this.isSortLocally) {
        this.sortLocally(id, currentOrder, sorttype);
      } else {
        this.sortOnServer(id, currentOrder, 1, 1 + this.step);
      }

    }
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onClickSort);
  }

  
  updateHeader(fieldId, order, cleanOrder = true) {
    const columns = this.subElements.header.children;
    if (cleanOrder) {
      for (let elem of columns) {
        elem.dataset.order = '';
      }
    }

    const currentColumn = this.subElements.header.querySelector(`[data-id="${fieldId}"]`);
    currentColumn.dataset.order = order;
    const hasArrow = currentColumn.querySelector('[data-element="arrow"]');

    if (!hasArrow) {
      const arrow = this.subElements.header.querySelector('[data-element="arrow"]');
      currentColumn.append(arrow);
    }
  }

  sortLocally(field, param, sorttype, customSort = () => {}) {
    const sortedData = this.sortData(field, param, sorttype, customSort);
    this.updateHeader(field, param);
    this.updateTable(sortedData);
  }

  sortData(field, param, sorttype, customSort) {
    const sortDirection = {
      asc: 1,
      desc: -1
    }

    const sortMethods = {
      string: (a, b) => a[field].localeCompare(b[field], ['ru', 'en'], { caseFirst: 'upper' }),
      number: (a, b) => a[field] > b[field] ? 1 : -1,
      custom: (a, b) => customSort(a[field] > b[field]),
      default: (a, b) => a[field] > b[field] ? 1 : -1,
    }
    
    return [...this.data].sort((a, b) => {
      if (sortMethods[sorttype]) {
        return sortMethods[sorttype](a, b) * sortDirection[param];
      } else {
        return sortMethods.default(a, b) * sortDirection[param];
      }
    });
  }

  async sortOnServer(field, param, start, end) {
    const sortedData = await this.loadData(field, param, start, end);
    this.updateHeader(field, param);
    this.updateTable(sortedData);
  }

  remove() {
    this.element.remove();
    for (let field in this.subElements) {
      this.subElements[field].remove();
    }
  }

  destroy() {
    this.remove();
  }
}