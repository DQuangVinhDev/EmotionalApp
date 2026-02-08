import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Heart, Settings, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MobileLayout() {
    const location = useLocation();
    const hideNav = ['/login', '/register', '/pair', '/lovemap', '/checkin', '/kudos', '/repair', '/deck'].includes(location.pathname);

    return (
        <div className="mobile-view flex flex-col relative min-h-screen">
            <main className={`flex-1 overflow-y-auto ${hideNav ? '' : 'pb-32'}`}>
                <Outlet />
            </main>

            {!hideNav && (
                <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-6 pb-8 z-50">
                    <nav className="glass-nav rounded-[2.5rem] p-1.5 flex justify-between items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden">
                        <NavItem
                            to="/"
                            icon={<Home size={24} />}
                            isActive={location.pathname === '/'}
                        />
                        <NavItem
                            to="/feed"
                            icon={<MessageSquare size={24} />}
                            isActive={location.pathname === '/feed'}
                        />
                        <NavItem
                            to="/map"
                            icon={<MapPin size={24} />}
                            isActive={location.pathname === '/map'}
                        />
                        <NavItem
                            to="/ritual"
                            icon={<Heart size={24} />}
                            isActive={location.pathname === '/ritual'}
                        />
                        <NavItem
                            to="/settings"
                            icon={<Settings size={24} />}
                            isActive={location.pathname === '/settings'}
                        />
                    </nav>
                </div>
            )}
        </div>
    );
}

function NavItem({ to, icon, isActive }: { to: string; icon: React.ReactNode; isActive: boolean }) {
    return (
        <NavLink
            to={to}
            className="relative flex-1"
        >
            <div className={`flex items-center justify-center p-3.5 rounded-[1.5rem] transition-all duration-300 ${isActive ? 'text-rose-500' : 'text-slate-500 opacity-60 hover:opacity-100'}`}>
                {isActive && (
                    <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-x-2 inset-y-2 bg-rose-500/10 rounded-2xl -z-10 border border-rose-500/20"
                        transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                    />
                )}
                <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                    {icon}
                </div>
            </div>
        </NavLink>
    );
}
