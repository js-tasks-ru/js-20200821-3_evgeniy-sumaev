import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BASE_URL = 'https://course-js.javascript.ru';
const CATEGORY_URL = 'api/rest/categories?_sort=weight&_refs=subcategory';
const PRODUCT_DATA_URL = `api/rest/products`;

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor (productId) {
    this.productId = productId;
  }

  async render() {
    const categoriesPromise = fetchJson(`${BASE_URL}/${CATEGORY_URL}`);

    const productPromise = this.productId 
      ? fetchJson(`${BASE_URL}/${PRODUCT_DATA_URL}?id=${this.productId}`)
      : this.defaultFormData;

    const [categoriesData, [productData]] = await Promise.all([categoriesPromise, productPromise]);

    this.formData = productData;
    this.categories = categoriesData;
    console.log(this.formData);
    console.log(this.categories);

    const formWrap = document.createElement('div');

    formWrap.innerHTML = this.formData
      ? this.getTemplate()
      : this.getEmptyTemplate();

    this.element = formWrap.firstElementChild;
    this.subElements = this.getSubElements();

    this.setFormData();

    return this.element;
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-elem="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" data-form="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" data-form="description" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-elem="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-elem="imageListContainer">
              <ul class="sortable-list">
                ${this.getImageList()}
                ${console.log(this.getImageList())}
              </ul>
            </div>
            <button type="button" name="uploadImage" class="button-primary-outline fit-content">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.createCategoriesSelect()}
            ${console.log(this.createCategoriesSelect())}
            <select class="form-control" name="category">
              <option value="tovary-dlya-kuxni">Бытовая техника &gt; Товары для кухни</option>
              <option value="krasota-i-zdorove">Бытовая техника &gt; Красота и здоровье</option>
              <option value="tovary-dlya-doma">Бытовая техника &gt; Товары для дома</option>
              <option value="planshety-elektronnye-knigi">Смартфоны &gt; Планшеты, электронные книги</option><option value="fototexnika">Смартфоны &gt; Фототехника</option><option value="smartfony-i-gadzhety">Смартфоны &gt; Смартфоны и гаджеты</option><option value="audiotexnika">ТВ и Развлечения &gt; Аудиотехника</option><option value="igry-i-xobbi">ТВ и Развлечения &gt; Игры и хобби</option><option value="televizory-i-aksessuary">ТВ и Развлечения &gt; Телевизоры и аксессуары</option><option value="kompyutery-noutbuki-i-po">Компьютеры &gt; Компьютеры, ноутбуки и ПО</option><option value="periferiya-i-aksessuary">Компьютеры &gt; Периферия и аксессуары</option><option value="komplektuyushhie-dlya-pk">Компьютеры &gt; Комплектующие для ПК</option><option value="orgtexnika-i-ofisnoe-oborudovanie">Офис и сеть &gt; Оргтехника и офисное оборудование</option><option value="professionalnoe-setevoe-oborudovanie">Офис и сеть &gt; Профессиональное сетевое оборудование</option><option value="marshrutizatory-i-prochee-besprovodnoe-oborudovanie">Офис и сеть &gt; Маршрутизаторы и прочее беспроводное оборудование</option><option value="aksessuary-dlya-mobilnyx-ustrojstv">Аксессуары &gt; Для мобильных устройств</option><option value="aksessuary-dlya-bytovoj-texniki">Аксессуары &gt; Для бытовой техники</option><option value="aksessuary-dlya-kompyuterov-i-noutbukov">Аксессуары &gt; Для компьютеров и ноутбуков</option><option value="naruzhnye-i-vnutrisalonnye-aksessuary">Автотовары &gt; Наружные и внутрисалонные аксессуары</option><option value="avtoelektronika-i-protivougonnye-sistemy">Автотовары &gt; Автоэлектроника и противоугонные системы</option><option value="avtozvuk">Автотовары &gt; Автозвук</option><option value="stroitelstvo-izmerenie-i-uborka">Инструменты &gt; Строительство, измерение и уборка</option><option value="elektroinstrumenty-i-texnika-dlya-sada">Инструменты &gt; Электроинструменты и техника для сада</option><option value="ruchnoj-instrument-i-osnastka">Инструменты &gt; Ручной инструмент и оснастка</option>
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" data-form="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" data-form="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" data-form="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" data-form="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>`
  }

  getImageList() {
    return this.formData.images.map(({url, source}) => `
        <li class='products-edit__imagelist-item sortable-list__item'>
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`).join('');
  }

  getEmptyTemplate() {
    return `
      <div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>`;
  }

  setFormData() {
    const daya = Object.keys(this.defaultFormData)
      .filter(key => key !== 'images')
      .forEach(item => {
        if (this.formData[item]) {
          this.element.querySelector(`[data-form=${item}]`).value = this.formData[item];
        }
      })
  }

  createCategoriesSelect() {
    return `
    <select class="form-control" name="subcategory" data-form="subcategory">
      ${this.categories.reduce((accum, { title: mainTitle, subcategories }) => {
        return accum + subcategories.reduce((acc, { title, id }) => {
          return acc + `<option value=${id}>${mainTitle} &gt; ${title}</option>`;
        }, '');
      }, '')}
    </select>`
  }



  getSubElements() {
    const subElements = document.querySelectorAll('[data-elem]');

    return [...subElements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {})
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }


}
