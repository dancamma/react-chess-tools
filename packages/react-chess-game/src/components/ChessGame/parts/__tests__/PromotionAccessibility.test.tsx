import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { ChessGame } from "../..";

it("names promotion choices, contains keyboard focus, and restores board focus on Escape", () => {
  const { container } = render(
    <ChessGame.Root fen="7k/5P2/6K1/8/8/8/8/8 w - - 0 1">
      <ChessGame.Board
        options={{ showAnimations: false }}
        aria-label="Board"
        promotionDialogLabel="Promuovi"
        promotionLabels={{ q: "Donna", r: "Torre", n: "Cavallo", b: "Alfiere" }}
      />
    </ChessGame.Root>,
  );
  const click = (square: string) =>
    fireEvent.click(container.querySelector(`[data-square="${square}"]`)!);
  click("f7");
  click("f8");
  expect(screen.getByRole("dialog", { name: "Promuovi" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Donna" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
  expect(screen.getByRole("button", { name: "Alfiere" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: "Tab" });
  expect(screen.getByRole("button", { name: "Donna" })).toHaveFocus();
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Board")).toHaveFocus();
  click("f7");
  click("f8");
  fireEvent.click(screen.getByRole("button", { name: "Torre" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(
    container.querySelector('[data-square="f8"] [data-piece="wR"]'),
  ).toBeInTheDocument();
});

it("dismisses a pending promotion when the game is disabled", () => {
  const fen = "7k/5P2/6K1/8/8/8/8/8 w - - 0 1";
  const { container, rerender } = render(
    <ChessGame.Root fen={fen}>
      <ChessGame.Board options={{ showAnimations: false }} />
    </ChessGame.Root>,
  );
  fireEvent.click(container.querySelector('[data-square="f7"]')!);
  fireEvent.click(container.querySelector('[data-square="f8"]')!);
  expect(screen.getByRole("dialog")).toBeVisible();
  rerender(
    <ChessGame.Root fen={fen} disabled>
      <ChessGame.Board options={{ showAnimations: false }} />
    </ChessGame.Root>,
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(
    container.querySelector('[data-square="f7"] [data-piece="wP"]'),
  ).toBeInTheDocument();
});
