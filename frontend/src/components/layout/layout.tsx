import type { PropsWithChildren } from "react";
import Header from "./header";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
