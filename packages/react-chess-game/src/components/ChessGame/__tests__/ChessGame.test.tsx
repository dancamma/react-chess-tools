import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChessGame } from "../index";

// Mock the Chessboard component since it comes from react-chessboard
jest.mock("react-chessboard", () => ({
  Chessboard: jest.fn(() => <div data-testid="mock-chessboard" />),
}));

describe("ChessGame components", () => {
  it("renders ChessGame.Board component", () => {
    const { getByTestId } = render(
      <ChessGame.Root>
        <ChessGame.Board position="start" />
      </ChessGame.Root>,
    );

    // Check if the mocked chessboard is rendered
    expect(getByTestId("mock-chessboard")).toBeInTheDocument();
  });
});
