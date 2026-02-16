import React from 'react';
import { SignInButton, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="landing-container">
            <h1>Structure Your Learning with AI</h1>
            <p>Create personalized learning plans in seconds.</p>

            <SignedOut>
                <SignInButton mode="modal">
                    <button className="cta-button">Get Started</button>
                </SignInButton>
            </SignedOut>

            <SignedIn>
                <Link to="/onboarding">
                    <button className="cta-button">Get Started</button>
                </Link>
            </SignedIn>
        </div>
    );
}
