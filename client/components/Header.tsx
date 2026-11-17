'use client';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
//define roles
export default function Header({ role }: { role: string }) {
  const { user, logout } = useUser();
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push('/'); };


  return (
    <header className="topbar">
      <span className="brand">Rappi</span>
      <div className="topbar-right">
        <span className="role-pill">{role}</span>
        <span className="user-name">{user?.name}</span>
        <button className="btn-outline" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </header>
  );
}



