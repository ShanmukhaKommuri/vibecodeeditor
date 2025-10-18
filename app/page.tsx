import Image from "next/image";
import { Button } from "@/components/ui/button";
import { db } from '@/lib/db'
export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Button>
        Get Started
      </Button>
    </div>
  );
}
