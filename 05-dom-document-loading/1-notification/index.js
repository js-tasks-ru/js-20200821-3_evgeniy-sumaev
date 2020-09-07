export default class NotificationMessage {

  constructor(message = '', { duration = 0, type = ''} = {}) {
    if (NotificationMessage.activeElem) {
      NotificationMessage.activeElem.remove();
    } 

    this.message = message;
    this.duration = duration;
    this.type = type;
    this.render();
  }

  get renderStr() {
    return (
      `<div id='notification' class="notification ${this.type}" style="--value:${this.duration / 1e3}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          <div class="notification-body">
            ${this.message}
          </div>
        </div>
      </div>`
    )
  }

  render() {
    const elem = document.createElement('div');
    elem.innerHTML = this.renderStr;
    this.element = elem.firstElementChild;
    NotificationMessage.activeElem = this.element;
  }

  show(parent = document.body) {
    parent.append(this.element);
    setTimeout(this.remove.bind(this), this.duration);
  }

  remove() {
    this.element.remove();
  }
  
  destroy() {
    this.remove();
  }
}
