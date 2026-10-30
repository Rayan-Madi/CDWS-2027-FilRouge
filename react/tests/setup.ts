import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Sans afterEach global, Testing Library ne démonte rien entre deux tests
afterEach(cleanup);

// jsdom ne fait pas défiler : on remplace scrollTo pour que le Layout puisse l'appeler
window.scrollTo = vi.fn();
