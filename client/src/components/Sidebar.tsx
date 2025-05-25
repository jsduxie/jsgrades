import { Assignment, ShowChart } from '@mui/icons-material';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './UI';

type SidebarLinkProps = {
  page: string;
  label: string;
  icon: React.ReactNode;
  open: boolean;
};

const SidebarLink: React.FC<SidebarLinkProps> = ({
  page,
  label,
  icon,
  open,
}) => {
  const location = useLocation();
  const isActive = location.pathname === page;

  return (
    <Link
      to={page}
      className={clsx(
        'flex items-center py-2 rounded transition-colors px-4',
        'justify-start h-[75px]',
        isActive
          ? 'bg-secondary text-white'
          : 'text-gray-700 hover:bg-secondary'
      )}
    >
      <span className="flex items-center justify-center w-10 min-w-[40px]">
        {icon}
      </span>
      <span
        className={clsx(
          'ml-3 font-medium whitespace-nowrap transition-all duration-200 text-white',
          open
            ? 'opacity-100 w-auto ml-3'
            : 'opacity-0 w-0 ml-0 overflow-hidden'
        )}
      >
        {label}
      </span>
    </Link>
  );
};

export const Sidebar: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <aside
      className={clsx(
        'h-screen bg-primary border-r transition-all duration-300 flex flex-col relative',
        open ? 'w-[215px]' : 'w-[75px]'
      )}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div
        className={clsx(
          'w-[215px] flex justify-center items-center absolute top-[30px] z-10 transition-opacity duration-100',
          open ? 'opacity-1' : 'opacity-0'
        )}
      >
        <Logo height={50} fill="#fff" />
      </div>

      <nav className="flex flex-col gap-8 mt-[150px]">
        <SidebarLink
          page="/home"
          label="Home"
          icon={<HomeIcon className="text-[#efefef]" />}
          open={open}
        />
        <SidebarLink
          page="/grades"
          label="Grades"
          icon={<SchoolIcon className="text-[#efefef]" />}
          open={open}
        />
        <SidebarLink
          page="/tasks"
          label="Tasks"
          icon={<Assignment className="text-[#efefef]" />}
          open={open}
        />
        <SidebarLink
          page="/vis"
          label="Visualise"
          icon={<ShowChart className="text-[#efefef]" />}
          open={open}
        />
      </nav>
      <div className="absolute w-full left-0 bottom-[75px]">
        <SidebarLink
          page="/settings"
          label="Settings"
          icon={<SettingsIcon className="text-[#efefef]" />}
          open={open}
        />
      </div>
    </aside>
  );
};
