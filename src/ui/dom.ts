/** A few elements the table is built from. Text is set as text, never as HTML. */

export function node<K extends keyof HTMLElementTagNameMap>(
  name: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const made = document.createElement(name);
  if (className !== undefined) made.className = className;
  if (text !== undefined) made.textContent = text;
  return made;
}

export function button(text: string, onClick: () => void, primary = false, testId?: string): HTMLButtonElement {
  const made = node("button", primary ? "tk-button tk-primary" : "tk-button", text);
  made.type = "button";
  if (testId !== undefined) made.dataset.testid = testId;
  made.addEventListener("click", onClick);
  return made;
}

/** Hand a string to the person as a file of that name.
 * @param name - The file's name.
 * @param type - The file's media type.
 * @param text - The file's contents.
 */
export function save(name: string, type: string, text: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = node("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
