const $style = (elem: HTMLElement, obj: object) => {
  for (const prop in obj) {
    elem.style[prop] = obj[prop];
  }
};

export { $style };
