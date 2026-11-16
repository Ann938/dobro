import type { Metadata } from "next";
import Smooth from "@/components/Smooth";
import { StoriesIndex } from "@/components/StoryViews";

export const metadata: Metadata = { title: "Истории — Добро" };

export default function Page() {
  return (
    <>
      <Smooth />
      <StoriesIndex />
    </>
  );
}
