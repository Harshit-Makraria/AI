export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-700">
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-black">
          {children}
        </div>
      </div>
    );
  }
  