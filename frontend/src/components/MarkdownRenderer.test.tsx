import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownRenderer } from "./MarkdownRenderer";

describe("MarkdownRenderer", () => {
  it("renders plain text fallback if plain is true", () => {
    render(<MarkdownRenderer content="**bold text**" plain={true} />);
    const pre = screen.getByText("**bold text**");
    expect(pre).toBeInTheDocument();
    expect(pre.tagName).toBe("PRE");
  });

  it("renders markdown properly", () => {
    render(<MarkdownRenderer content="**bold text** and *italic*" />);
    const boldElement = screen.getByText("bold text");
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe("STRONG");
  });

  it("renders GFM table", () => {
    const tableMarkdown = `
| Header 1 | Header 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |
`;
    render(<MarkdownRenderer content={tableMarkdown} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("Header 1")).toBeInTheDocument();
    expect(screen.getByText("Cell 1")).toBeInTheDocument();
  });

  it("renders code block with custom component and CopyButton", () => {
    const codeMarkdown = "```javascript\nconst a = 1;\n```";
    render(<MarkdownRenderer content={codeMarkdown} />);
    const codeContainer = screen.getByText("const a = 1;").closest("pre");
    expect(codeContainer).toBeInTheDocument();
    // Copy button should be present in the container
    const copyButton = screen.getByRole("button", { name: /copy/i });
    expect(copyButton).toBeInTheDocument();
  });
});
