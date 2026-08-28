import { Suspense } from "react";
import AppHome from "@/components/AppHome";

export default function Home() {
  return <Suspense fallback={null}><AppHome /></Suspense>;
}
