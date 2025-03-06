import { ColorSchemeToggle } from "@/components/themeToggle/themeToggle";
import { Welcome } from "@/components/welcome/welcome";


export default function HomePage() {
  return (
    <>
      <Welcome />
      <ColorSchemeToggle />
    </>
  );
}