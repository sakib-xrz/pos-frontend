import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LoginForm } from "../../_components/login-form";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm">
            ← Back to Home
          </Button>
        </Link>
      </div>
      <LoginForm userType="admin" />
    </div>
  );
}
