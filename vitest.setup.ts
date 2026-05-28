import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const {
      fill: _fill,
      priority: _priority,
      ...rest
    } = props as Record<string, unknown>;
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement("img", rest);
  },
}));
