"use client";

import { Card } from "@/components/ui/card";
export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-center mb-8">
          <img
            src="/logo.png"
            alt="MRCGP[INT] South Asia Logo"
            width={220}
            height={120}
            className="h-auto"
          />
        </div>

        <Card className="w-full p-8 shadow-sm bg-blue-900">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-semibold text-white-800">Oops!</h1>
            <p className="text-lg text-white-600">No Exam found.</p>
          </div>
        </Card>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} MRCGP[INT] South Asia. All rights
            reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
