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
      : [this.defaultFormData];

    const [categoriesData, [productData]] = await Promise.all([categoriesPromise, productPromise]);

    this.formData = productData;
    this.categories = categoriesData;

    const formWrap = document.createElement('div');

    if (this.formData) {
      formWrap.innerHTML = this.getTemplate();
      this.element = formWrap.firstElementChild;
    } else {
      formWrap.innerHTML = this.getEmptyTemplate();
      this.element = formWrap.firstElementChild;
      return;
    }

    this.subElements = this.getSubElements();

    this.setFormData();
    this.initEventListeners();

    return this.element;
  }

  getTemplate() {
    return `
      (<div class="product-form">
        <form data-elem="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" id="title" data-form="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-form="description" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-elem="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-elem="imageListContainer">
              <ul class="sortable-list">
                ${this.getImageList()}
              </ul>
            </div>
            <button type="button" name="uploadImage" data-elem="uploadImageBtn" class="button-primary-outline fit-content">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.getCategoriesSelect()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" id="price" data-form="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" id="discount" data-form="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" id="quantity" data-form="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status" data-form="status">
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
      </div>)`
  }

  getImageList() {
    return this.formData.images
      .map(({ url, source }) => this.getImageItem(url, source)).join('');
  }

  getImageItem(url, name) {
    return `
        <li class='products-edit__imagelist-item sortable-list__item'>
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;
  }

  getEmptyTemplate() {
    return `
      <div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>`;
  }

  getCategoriesSelect() {
    return `
    <select class="form-control" name="subcategory" id="subcategory" data-form="subcategory">
      ${this.categories.reduce((accum, { title: mainTitle, subcategories }) => {
        return accum + subcategories.reduce((acc, { title, id }) => {
          return acc + `<option value=${id}>${mainTitle} &gt; ${title}</option>`;
        }, '');
      }, '')}
    </select>`
  }

  getSubElements() {
    const subElements = this.element.querySelectorAll('[data-elem]');

    return [...subElements].reduce((acc, subElement) => {
      const subElementName = subElement.dataset.elem;
      acc[subElementName] = subElement;
      return acc;
    }, {})
  }
  
  setFormData() {
    Object.keys(this.defaultFormData)
      .filter(feild => feild !== 'images')
      .forEach(feild => {
        if (this.formData[feild]) {
          this.element.querySelector(`[data-form=${feild}]`).value = this.formData[feild];
        }
      })
  }

  initEventListeners() {
    const { productForm, uploadImageBtn, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.submitForm);
    uploadImageBtn.addEventListener('click', this.uploadImage);
    imageListContainer.addEventListener('click', this.deleteImage);
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    const { uploadImageBtn, imageListContainer } = this.subElements;
    fileInput.addEventListener('change', addImage.bind(this));
    
    async function addImage() {
      if (fileInput.files.length) {
        uploadImageBtn.classList.add('is-loading');
        uploadImageBtn.disabled = true;

        const img = fileInput.files[0];
        const formData = new FormData();
        formData.append('image', img);

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData
        })

        const newImg = this.getImageItem(result.data.link, img.name);
        imageListContainer.firstElementChild.insertAdjacentHTML('beforeEnd', newImg);
        
        uploadImageBtn.classList.remove('is-loading');
        uploadImageBtn.disabled = false;

        fileInput.remove();
      }

    }

    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  }

  deleteImage = event => {
    if ('deleteHandle' in event.target.dataset) {
      event.target.closest('.sortable-list__item').remove();
    }
  }

  submitForm = async event => {
    event.preventDefault();
    const method = this.productId ? 'PATCH' : 'PUT';

    try {
      const result = await fetchJson(`${BASE_URL}/${PRODUCT_DATA_URL}`, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.getFormData())
      })

      this.save(result.id);
    } catch (error) {
      console.error('something went wrong', error);
    }

  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const numberFields = ['price', 'quantity', 'discount', 'status'];

    const values = [...productForm.querySelectorAll('[data-form]')]
      .reduce((acc, { name, value }) => {
        if (numberFields.includes(name)) {
          acc[name] = parseInt(value);
        } else {
          acc[name] = value;
        }
        return acc;
      }, {});
  
    values.images = [];
    values.id = this.productId;

    imageListContainer
      .querySelectorAll('.sortable-table__cell-img')
      .forEach(({ src, alt }) => {
        values.images.push({
            url: src,
            source: alt
          })
      })

    return values;
  }

  save(id) {
    const event = this.productId ? 'product-updated' : 'product-saved';
    this.element.dispatchEvent(new CustomEvent(event, { detail: id }));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

}
