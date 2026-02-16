import { Outlet } from 'react-router-dom';
import { UserButton } from '@clerk/clerk-react';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-6">
                    <UserButton />
                </header>
                <main className="flex-1 p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
