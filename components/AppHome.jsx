"use client";

import { useSearchParams } from "next/navigation";
import Hero from "@/components/Hero";
import EventDetails from "@/components/EventDetails";
import RsvpForm from "@/components/RsvpForm";
import Footer from "@/components/Footer";
import ManageRsvp from "@/components/ManageRsvp";

export default function AppHome() {
  const searchParams = useSearchParams();
  if (searchParams.get("manage")) return <ManageRsvp />;

  return (
    <main className="page">
      <Hero />
      <EventDetails />
      <RsvpForm />
      <Footer />
    </main>
  );
}
