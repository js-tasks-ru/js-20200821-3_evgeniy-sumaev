export default class RangePicker {
  subElements = {};
  selected = {};

  constructor({ 
    from = new Date(),
    to = new Date() 
  }) {
    this.from = this.normalizeDate(from);
    this.to = this.normalizeDate(to);
    this.selected.from = this.normalizeDate(from);
    this.selected.to = this.normalizeDate(to);

    this.render();
  }

  normalizeDate(date) {
    return date.toLocaleString('ru', {dateStyle: 'short'})
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
        <span data-elem="from">22.08.2020</span> -
        <span data-elem="to">21.09.2020</span>
      </div>
      <div class="rangepicker__selector" data-elem="selector">
        <div class="rangepicker__selector-arrow"></div>
        <div class="rangepicker__selector-control-left"></div>
        <div class="rangepicker__selector-control-right"></div>
        ${this.getCalendar(new Date())}
      </div>
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

  setRange(from, to) {
    const { from: fromElem, to: toElem } = this.subElements;

    fromElem.textContent = from;
    toElem.textContent = to;
    this.from = from;
    this.to = to;
  }

  initEventListeners() {
    const { input, selector } = this.subElements;

    input.addEventListener('click', () => {
      this.element.classList.toggle('rangepicker_open');
    })

    selector.addEventListener('click', this.selectRange);

    document.addEventListener('click', event => {
      if (event.target.closest('[data-elem="input"]') 
        || event.target.closest('[data-elem="selector"]')) return;

      this.element.classList.remove('rangepicker_open');
    })

    selector
      .querySelector('.rangepicker__selector-control-right')
      .addEventListener('click', this.nextMonth);

    selector
      .querySelector('.rangepicker__selector-control-left')
      .addEventListener('click', this.prevMonth);
  }

  selectRange = event => {
    const { selector } = this.subElements;

    if (!event.target.closest('.rangepicker__cell')) return;

    if (this.selected.from && this.selected.to) {
      this.selected.from = null;
      this.selected.to = null;
      selector
        .querySelectorAll('.rangepicker__cell')
        .forEach(button => {
          button.classList.remove('rangepicker__selected-from')
          button.classList.remove('rangepicker__selected-between')
          button.classList.remove('rangepicker__selected-to')
        })

      this.getDate(event);
      event.target.classList.add('rangepicker__selected-from');
    } else {
      event.target.classList.add('rangepicker__selected-to');
    }
  }

  getDate(event) {
    const day = event.target.textContent;
    const month = event
      .target.closest('.rangepicker__calendar')
      .querySelector('[datetime]')
      .textContent;
  }

  prevMonth = () => {
    const { selector } = this.subElements;
    const date = selector.querySelector('[style^="--start-from"]').dataset.value;
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth();

    selector.querySelectorAll('.rangepicker__calendar').forEach(elem => elem.remove());

    selector.insertAdjacentHTML('beforeEnd', this.getCalendar(new Date(year, month - 1)));
  }

  nextMonth = () => {
    const { selector } = this.subElements;
    const date = selector.querySelector('[style^="--start-from"]').dataset.value;
    const year = new Date(date).getFullYear();
    const month = new Date(date).getMonth();

    selector.querySelectorAll('.rangepicker__calendar').forEach(elem => elem.remove());

    selector.insertAdjacentHTML('beforeEnd', this.getCalendar(new Date(year, month + 1)));
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
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
