export default class RangePicker {
  subElements = {};
  selected = {};

  constructor({ 
    from = new Date(),
    to = new Date() 
  }) {
    this.from = from;
    this.to = to;

    this.render();
  }

  normalizeDate(date) {
    return new Date(date).toLocaleString('ru', {dateStyle: 'short'})
  }

  render() {
    const picker = document.createElement("div");
    picker.innerHTML = this.getTemplate();

    this.element = picker.firstElementChild;
    this.subElements = this.getSubElements();
    this.setRange(this.from, this.to);

    this.initEventListeners();
  }


  getTemplate() {
    return `
    <div class="rangepicker">
      <div class="rangepicker__input" data-elem="input">
        <span data-elem="from"></span> -
        <span data-elem="to"></span>
      </div>
      <div class="rangepicker__selector" data-elem="selector"></div>
    </div>`;
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll("[data-elem]");

    return [...subElements].reduce((acc, subElement) => {
      const subElementName = subElement.dataset.elem;
      acc[subElementName] = subElement;
      return acc;
    }, {});
  }

  initEventListeners() {
    const { input, selector } = this.subElements;

    input.addEventListener('click', () => {
      this.element.classList.toggle('rangepicker_open');

      if (!selector.innerHTML) {
        selector.innerHTML = this.getSelectorHtml();

        selector.addEventListener('click', this.selectRange);
      
        selector
          .querySelector('.rangepicker__selector-control-right')
          .addEventListener('click', this.nextMonth);
      
        selector
          .querySelector('.rangepicker__selector-control-left')
          .addEventListener('click', this.prevMonth);

        const click = new CustomEvent('click', {
          bubbles: true,
          detail: {first: true}
        });

        selector
          .querySelector(`[data-value="${this.from.toISOString()}"]`)
          .dispatchEvent(click);

        selector
          .querySelector(`[data-value="${this.to.toISOString()}"]`)
          .dispatchEvent(click);
      }
    })

    document.addEventListener('click', this.closePicker, true);
  }

  closePicker = event => {
    if (event.target.closest('[data-elem="input"]') 
      || event.target.closest('[data-elem="selector"]')) return;

    this.element.classList.remove('rangepicker_open');
  }

  setRange(from, to) {
    const { from: fromElem, to: toElem, selector } = this.subElements;

    fromElem.textContent = this.normalizeDate(from);
    toElem.textContent = this.normalizeDate(to);
  }

  selectRange = event => {
    const { selector, from: fromElem, to: toElem } = this.subElements;

    if (!event.target.closest('.rangepicker__cell')) return;

    if (this.selected.from && this.selected.to) {
      this.selected.from = null;
      this.selected.to = null;
    }

    if (!this.selected.from && !this.selected.to) {
      this.selected.from = new Date(event.target.dataset.value);

      selector
        .querySelectorAll('.rangepicker__cell')
        .forEach(button => {
          button.classList.remove('rangepicker__selected-from')
          button.classList.remove('rangepicker__selected-between')
          button.classList.remove('rangepicker__selected-to')
        })

      event.target.classList.add('rangepicker__selected-from');
    } else {
      const selectedDate = new Date(event.target.dataset.value);

      if (selectedDate < this.selected.from) {
        this.selected.to = this.selected.from;
        this.selected.from = selectedDate;
      } else {
        this.selected.to = selectedDate;
      }

      fromElem.textContent = this.normalizeDate(this.selected.from);
      toElem.textContent = this.normalizeDate(this.selected.to);

      this.markSelectedCells();

      if (!event.detail.first) {
        this.element.classList.remove('rangepicker_open');
        this.element.dispatchEvent(new CustomEvent('date-select', { detail: {...this.selected} }), );
      }

    }
  }

  markSelectedCells() {
    const { from, to } = this.selected;
    const { selector } = this.subElements;

    const prevFrom = selector.querySelector('.rangepicker__selected-from');
    const currentFrom = selector.querySelector(`[data-value="${from.toISOString()}"]`);
    const currentTo = to ? selector.querySelector(`[data-value="${to.toISOString()}"]`) : null;

    if (prevFrom) {
      prevFrom.classList.remove('rangepicker__selected-from');
    }
    
    if (currentFrom) {
      currentFrom.classList.add('rangepicker__selected-from');
    }

    if (currentTo) {
      currentTo.classList.add('rangepicker__selected-to');
    }

    selector
      .querySelectorAll('.rangepicker__cell')
      .forEach(button => {
        const buttonDate = new Date(button.dataset.value);
        if (buttonDate > from && buttonDate < to) {
          button.classList.add('rangepicker__selected-between');
        }
      })
  }

  prevMonth = () => {
    const { selector } = this.subElements;
    const date = selector.querySelector('[style^="--start-from"]').dataset.value;
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth();

    selector.querySelectorAll('.rangepicker__calendar').forEach(elem => elem.remove());

    selector.insertAdjacentHTML('beforeEnd', this.getCalendar(new Date(year, month - 1)));
    this.markSelectedCells();
  }

  nextMonth = () => {
    const { selector } = this.subElements;
    const date = selector.querySelector('[style^="--start-from"]').dataset.value;
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth();

    selector.querySelectorAll('.rangepicker__calendar').forEach(elem => elem.remove());

    selector.insertAdjacentHTML('beforeEnd', this.getCalendar(new Date(year, month + 1)));
    this.markSelectedCells();
  }

  getSelectorHtml() {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.getCalendar(this.from)}`
  }

  getCalendar(date, qty = 2) {
    const dateProps = (date, step = 0) => {
      const months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
      const currentDate = new Date(date.getFullYear(), date.getMonth() + step);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const longMonth = months[month].toLowerCase();

      return {
        year,
        month,
        longMonth,
        dayOfWeek: currentDate.getDay() || 7,
        dayInMonth: 32 - new Date(year, month, 32).getDate(),
      }
    }

    return new Array(qty).fill('').reduce((acc, _, i) => {
      return acc + this.getMonthCalendar( dateProps(date, i) );
    }, '')
  }

  getMonthCalendar({ year, month, longMonth, dayOfWeek, dayInMonth }) {
    return `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${longMonth}">${longMonth}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div><div>Вт</div><div>Ср</div><div>Чт</div><div>Пт</div><div>Сб</div><div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${this.getDateButtons(year, month, dayOfWeek, dayInMonth)}
        </div>
      </div>`
  }

  getDateButtons(year, month, dayOfWeek, dayInMonth) {
    let string = `
      <button
        type="button"
        class="rangepicker__cell"
        data-value=${new Date(year, month, 1).toISOString()}
        style="--start-from: ${dayOfWeek}"
      >
        1
      </button>`;

    for (let i = 2; i <= dayInMonth; i += 1) {
      string += `<button
          type="button"
          class="rangepicker__cell"
          data-value=${new Date(year, month, i).toISOString()}
        >
          ${i}
        </button>`;
    }

    return string;
  }

  remove() {
    document.removeEventListener('click', this.closePicker, true);
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
