import Link from "next/link"

export default function ConfirmationSuccess() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <h1 className="mb-4 text-center text-2xl font-bold">Email Confirmed!</h1>
        <p className="mb-6 text-center text-gray-600">
          Your email has been successfully confirmed. You can now log in to your account.
        </p>
        <div className="flex justify-center">
          <Link
            href="/auth?tab=login"
            className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Log in to your account
          </Link>
        </div>
      </div>
    </div>
  )
}
