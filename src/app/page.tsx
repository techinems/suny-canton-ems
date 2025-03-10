import { redirect } from "next/navigation";


export default function HomePage() {
  redirect('/login');
  return  (
    <div>TODO, Could be a home page or something</div>
  );
}