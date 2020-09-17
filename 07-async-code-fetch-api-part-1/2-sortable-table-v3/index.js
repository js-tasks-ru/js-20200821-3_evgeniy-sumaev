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

  onClickSort(e) {
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

    const column = e.target.closest('[data-sortable="true"]');
    if (column) {
      const { id, order, sorttype } = column.dataset;
      const currentOrder = nextOrder(order);
      this.sort(id, currentOrder, sorttype);
    }
  }

  initEventListeners() {
    this.subElements.header.addEventListener('pointerdown', e => this.onClickSort(e));
  }

    
  createTableHeader() {
    const tableHeader = document.createElement('div');
    tableHeader.className = 'sortable-table__header sortable-table__row';
    tableHeader.dataset.element = 'header';
    this.subElements.header = tableHeader;
    this.setTableHeader();
  }

  setTableHeader() {
    this.subElements.header.innerHTML = this.getHeaderStr(this.header);
  }

  getHeaderStr(header) {
    return (
      `${header.map(({id, title, sortable, sortType}) => {
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

  updateHeader(fieldId, order, cleanOrder = true) {
    const columns = this.subElements.header.children;
    if (cleanOrder) {
      for (let elem of columns) {
        elem.dataset.order = '';
      }
    }

    const currentColumn = this.subElements.header.querySelector(`[data-id="${fieldId}"]`);
    currentColumn.dataset.order = order;
    const hasArrow = !!currentColumn.querySelector('[data-element="arrow"]');

    if (!hasArrow) {
      const arrow = this.subElements.header.querySelector('[data-element="arrow"]');
      currentColumn.append(arrow);
    }
  }

  createTableBody() {
    const tableBody = document.createElement('div');
    tableBody.className = 'sortable-table__body';
    tableBody.dataset.element = 'body';
    this.subElements.body = tableBody;
    const { id, order, sortType } = this.sorted;
    const sortedData = this.sortData(id, order, sortType);
    this.updateHeader(id, order, false);
    this.setTableBody(sortedData);
  }

  setTableBody(data) {
    this.subElements.body.innerHTML = this.getBodyStr(this.header, data);
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

  createTableElement() {
    const table = document.createElement('div');
    table.className = 'sortable-table';
    this.element = table;
  }


  sort(field, param, sorttype, customSort = () => {}) {
    this.updateHeader(field, param);
    const sortedData = this.sortData(field, param, sorttype, customSort);
    this.setTableBody(sortedData);
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
  

  render() {
    this.createTableHeader();
    this.createTableBody();
    this.createTableElement();
    this.element.append(this.subElements.header);
    this.element.append(this.subElements.body);
    this.initEventListeners();
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