import React from "react";

export interface RootProps {}

export const Root: React.FC<React.PropsWithChildren<RootProps>> = () => {
  return <div>Hello from Chess Puzzle Rush!</div>;
};
