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
    this.updateBody(this.data);
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
        ${this.getBodyStr(data)}
      </div>
    `)
  }

  getBodyStr(data) {
    return `${data.map(tableRowItem => this.getBodyRow(this.header, tableRowItem)).join('')}`;
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

  onScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { clientHeight } = document.documentElement;
    const { id, order } = this.sorted;

    if (bottom < clientHeight && !this.loading && !this.isSortLocally) {
      this.loading = true;

      const nextEnd = this.end + this.step;
      const newData = await this.loadData(id, order, this.end, nextEnd);
      this.loading = false;
      
      this.data = [...this.data, ...newData];
      this.updateTable(this.data);
    } 
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onClickSort);
    document.addEventListener('scroll', this.onScroll);
  }
  
  updateHeader() {
    const columns = this.subElements.header.children;
    const { id, order } = this.sorted;

    for (let elem of columns) {
      elem.dataset.order = '';
    }

    const currentColumn = this.subElements.header.querySelector(`[data-id="${id}"]`);
    currentColumn.dataset.order = order;
    const hasArrow = currentColumn.querySelector('[data-element="arrow"]');

    if (!hasArrow) {
      const arrow = this.subElements.header.querySelector('[data-element="arrow"]');
      currentColumn.append(arrow);
    }
  }

  updateBody(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table_empty');
      this.subElements.body.innerHTML = this.getBodyStr(data);
    } else {
      this.element.classList.add('sortable-table_empty');
    }
  }

  updateTable(data) {
    this.updateHeader();
    this.updateBody(data)
  }

  sortLocally(id, param, sorttype, customSort = () => {}) {
    const sortedData = this.sortData(id, param, sorttype, customSort);
    this.updateTable(sortedData);
  }

  sortData(id, param, sorttype, customSort) {
    const sortDirection = {
      asc: 1,
      desc: -1
    }

    const sortMethods = {
      string: (a, b) => a[id].localeCompare(b[id], ['ru', 'en'], { caseFirst: 'upper' }),
      number: (a, b) => a[id] > b[id] ? 1 : -1,
      custom: (a, b) => customSort(a[id] > b[id]),
      default: (a, b) => a[id] > b[id] ? 1 : -1,
    }
    
    return [...this.data].sort((a, b) => {
      if (sortMethods[sorttype]) {
        return sortMethods[sorttype](a, b) * sortDirection[param];
      } else {
        return sortMethods.default(a, b) * sortDirection[param];
      }
    });
  }

  async sortOnServer(id, param, start, end) {
    const sortedData = await this.loadData(id, param, start, end);
    this.updateTable(sortedData);
  }

  remove() {
    this.element.remove();
    for (let id in this.subElements) {
      this.subElements[id].remove();
    }
    document.removeEventListener('scroll', this.onScroll);
  }

  destroy() {
    this.remove();
  }
}