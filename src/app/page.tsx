import { LandingPage } from "@/components/LandingPage";

export default function Home() {
  return <LandingPage whatsappUrl={process.env.WHATSAPP_URL ?? null} />;
}