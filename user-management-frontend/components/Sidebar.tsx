'use client'

import Link from 'next/link';
import { useRouter } from 'next/router';

const Sidebar = () => {
  const router = useRouter();
  const { pathname } = router;

  return (
    <aside className="bg-white text-#667085 w-56 py-4 relative mt-18">
      <nav>
        <ul className="space-y-2">
          <li className={`flex items-center py-3 px-4  rounded space-x-1 ${pathname === '/view' ? 'bg-purple-100' : ''}`}>
            <img src={pathname === '/view' ? "/group.svg" : "/group_inactive.svg"} alt="All Team Members Icon" className="h-full" />
            <Link href="/view" className={`ml-2 ${pathname === '/view' ? 'text-#561FE7' : 'text-#667085'}`}>
              All Team Members
            </Link>
          </li>
          <li className={`flex items-center py-3 px-4  rounded space-x-1 ${pathname === '/create' ? 'bg-purple-100' : ''}`}>
            <img src={pathname === '/create' ? "/person_add_inactive.svg" : "/person_add.svg"} alt="Create Profile Icon" className="h-full" />
            <Link href="/create" className={`ml-2 ${pathname === '/create' ? 'text-#561FE7' : 'text-#667085'}`}>
              Create Profile
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;


