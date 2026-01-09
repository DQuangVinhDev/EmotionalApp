import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Heart, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileLayout() {
    const location = useLocation();
    const hideNav = ['/login', '/register', '/pair', '/lovemap', '/checkin', '/kudos', '/repair'].includes(location.pathname);

    return (
        <div className="mobile-view flex flex-col relative min-h-screen">
            <main className="flex-1 overflow-y-auto pb-32">
                <Outlet />
            </main>

            {!hideNav && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pb-8 z-50">
                    <nav className="glass-nav rounded-[2.5rem] p-3 flex justify-between items-center shadow-2xl shadow-rose-200/50 border border-white/50 ring-1 ring-black/5">
                        <NavItem
                            to="/"
                            icon={<Home size={22} />}
                            label="Home"
                            isActive={location.pathname === '/'}
                        />
                        <NavItem
                            to="/feed"
                            icon={<MessageSquare size={22} />}
                            label="Feed"
                            isActive={location.pathname === '/feed'}
                        />
                        <NavItem
                            to="/ritual"
                            icon={<Heart size={22} />}
                            label="Ritual"
                            isActive={location.pathname === '/ritual'}
                        />
                        <NavItem
                            to="/settings"
                            icon={<Settings size={22} />}
                            label="Settings"
                            isActive={location.pathname === '/settings'}
                        />
                    </nav>
                </div>
            )}
        </div>
    );
}

function NavItem({ to, icon, label, isActive }: { to: string; icon: React.ReactNode; label: string; isActive: boolean }) {
    return (
        <NavLink
            to={to}
            className="relative flex-1"
        >
            <div className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'text-rose-600' : 'text-gray-400 font-medium opacity-60'}`}>
                {isActive && (
                    <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-x-2 inset-y-1 bg-rose-50 rounded-2xl -z-10 border border-rose-100/50"
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                    />
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                    {icon}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-all ${isActive ? 'opacity-100' : 'opacity-0 scale-75'}`}>
                    {label}
                </span>
            </div>
        </NavLink>
    );
}
