export default class SortableTable {

  subElements = {};

  constructor(header = [], {data = []} = {}) {
    Object.assign(this, {header, data});
    this.render();
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
      `${header.map(({id, title, sortable}) => {
          return (
            `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
              <span>${title}</span>
              <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
              </span>
            </div>`
          )
        }).join('')}`
    )
  }

  createTableBody() {
    const tableBody = document.createElement('div');
    tableBody.className = 'sortable-table__body';
    tableBody.dataset.element = 'body';
    this.subElements.body = tableBody;
    this.setTableBody();
  }

  setTableBody() {
    this.subElements.body.innerHTML = this.getBodyStr(this.header, this.data);
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
  
  sort(key, param) {
    const sortDirection = param === 'asc' ? 1 : param === 'desc' ? -1 : 0;

    function matchLocale (x, y) {
      if (typeof x === 'string' && typeof y === 'string') {
        const aIdx = x.toString()[0].search(/[a-zA-Z]/);
        const bIdx = y.toString()[0].search(/[a-zA-Z]/);
        return aIdx === bIdx ? 1 : -1;
      }
      return 1;
    }

    this.data.sort((a, b) => {
      const match = a[key] > b[key] ? 1 : -1;
      return match * sortDirection * matchLocale(a[key], b[key]);
    });

    this.setTableBody();
  }

  render() {
    this.createTableHeader();
    this.createTableBody();
    this.createTableElement();
    this.element.append(this.subElements.header);
    this.element.append(this.subElements.body);
  }

  remove() {
    this.element.remove();
    for (let key in this.subElements) {
      this.subElements[key].remove();
    }
  }

  destroy() {
    this.remove();
  }

}
