import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CopyButton } from "./CopyButton";

describe("CopyButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Setup clipboard mock
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
      writable: true,
      configurable: true,
    });
    // Setup window.isSecureContext mock
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should render correctly with title", () => {
    render(<CopyButton text="Test copy string" />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("title", "Copy to clipboard");
  });

  it("should write text to clipboard and show success feedback", async () => {
    render(<CopyButton text="Test copy string" />);
    const button = screen.getByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "Test copy string",
    );
    expect(button).toHaveAttribute("title", "Copied!");
    expect(screen.getByLabelText("Copied!")).toBeInTheDocument();

    // Fast-forward 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button).toHaveAttribute("title", "Copy to clipboard");
  });

  it("should handle function text resolution on click", async () => {
    const textFn = vi.fn().mockReturnValue("dynamic text");
    render(<CopyButton text={textFn} />);
    const button = screen.getByRole("button");

    expect(textFn).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(button);
    });

    expect(textFn).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("dynamic text");
  });

  it("should fallback to execCommand when clipboard is unavailable", async () => {
    // Make clipboard unavailable
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    // Mock document.execCommand
    const execCommandMock = vi.fn();
    Object.defineProperty(document, "execCommand", {
      value: execCommandMock,
      writable: true,
      configurable: true,
    });

    render(<CopyButton text="fallback text" />);
    const button = screen.getByRole("button");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(execCommandMock).toHaveBeenCalledWith("copy");
    expect(button).toHaveAttribute("title", "Copied!");
  });
});
