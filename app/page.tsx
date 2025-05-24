import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Restaurant POS</CardTitle>
          <CardDescription>Choose your login type</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Link href="/staff/login">
              <Button className="w-full" size="lg">
                Staff Login
              </Button>
            </Link>
            <Link href="/admin/login">
              <Button className="w-full" variant="outline" size="lg">
                Admin Login
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground w-full">
          <p className="text-center w-full">
            © {new Date().getFullYear()} Restaurant POS System
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
