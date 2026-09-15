export function pinInnerHtml(options: {
  locked: boolean;
  category: "bts" | "food";
  label: string;
}): string {
  const badge = options.category === "bts" ? "BTS Spot" : "Naver 4.8+";
  const lock = options.locked
    ? `<span class="bts-pin-lock" aria-hidden="true">🔒</span>`
    : "";
  return `<span class="bts-pin-glow"></span>
    <span class="bts-pin-head ${options.category}"></span>
    <span class="bts-pin-badge">${badge}${lock}</span>`;
}

export function createPinElement(
  options: {
    locked: boolean;
    category: "bts" | "food";
    label: string;
  },
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `bts-pin${options.locked ? " is-locked" : ""}`;
  button.setAttribute("aria-label", options.label);
  button.innerHTML = pinInnerHtml(options);
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    onClick();
  });
  return button;
}
