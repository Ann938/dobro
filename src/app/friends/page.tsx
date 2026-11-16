import type { Metadata } from "next";
import AllFriends from "@/components/AllFriends";
import Smooth from "@/components/Smooth";

export const metadata: Metadata = { title: "Все друзья — Добро" };

export default function Page() {
  return (
    <>
      <Smooth />
      <AllFriends />
    </>
  );
}
