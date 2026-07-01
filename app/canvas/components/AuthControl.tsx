'use client';

import { UserButton, SignInButton, useAuth } from '@clerk/nextjs';

export default function AuthControl() {
  const { isSignedIn } = useAuth();
  return (
    <div className="auth-control">
      {isSignedIn ? (
        <UserButton />
      ) : (
        <SignInButton mode="modal">
          <button className="sign-in-btn">Sign In</button>
        </SignInButton>
      )}
    </div>
  );
}
