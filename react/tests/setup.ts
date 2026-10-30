import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Sans afterEach global, Testing Library ne démonte rien entre deux tests
afterEach(cleanup);

// jsdom ne fait pas défiler : on remplace scrollTo pour que le Layout puisse l'appeler
window.scrollTo = vi.fn();

// jsdom ne connaît pas showModal() : le strict minimum pour que la Modale s'ouvre et se ferme
HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
  this.open = true;
};
HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
  if (!this.open) return;
  this.open = false;
  this.dispatchEvent(new Event("close"));
};
