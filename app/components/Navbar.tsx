'use client';

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { 
  ClipboardIcon, 
  Cog6ToothIcon,
  ChevronDownIcon,
  ChartBarSquareIcon,
} from "@heroicons/react/24/outline";

export function Navbar() {
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleDropdownClick = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const dropdownClasses = (isOpen: boolean) => `
    absolute top-[calc(100%+0.25rem)] left-1/2 -translate-x-1/2 w-56 rounded-xl 
    bg-slate-800/95 backdrop-blur-xl
    shadow-[0_0_40px_-4px_rgba(0,0,0,0.45)] py-2 z-[100] 
    border border-slate-700/50
    transform transition-all duration-200 ease-out origin-top
    ${isOpen 
      ? 'opacity-100 translate-y-0 scale-100' 
      : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'}
  `;

  const dropdownItemClasses = `
    block w-full px-4 py-2.5 text-sm text-white/80 hover:text-white
    hover:bg-slate-700/50 transition-colors duration-150
    border-l-2 border-transparent hover:border-[#4477FF]
    first:rounded-t-lg last:rounded-b-lg
  `;

  const dropdownButtonClasses = `
    flex items-center rounded-md px-4 py-2.5 text-sm font-semibold 
    text-white/80 hover:text-white hover:bg-slate-800/80
    transition-all duration-200 relative group
    after:absolute after:bottom-0 after:left-0 after:h-[2px] 
    after:bg-[#4477FF] after:transition-all after:duration-300
    hover:after:w-full
  `;

  return (
    <nav className="bg-slate-900/95 backdrop-blur-lg shadow-lg border-b border-slate-800 relative z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center gap-2 group"
            >
              <div className="relative w-[140px] h-[35px]">
                <Image
                  src="/flog-logo.png"
                  alt="FLOG"
                  fill
                  className="object-contain transition-opacity group-hover:opacity-90"
                  priority
                />
              </div>
            </Link>
          </div>
          <div className="flex items-center">
            {session ? (
              <>
                {/* Primary Action */}
                <div className="mr-6">
                  <Link
                    href="/log-workout"
                    className="rounded-md bg-[#4477FF] px-4 py-2.5 text-sm font-bold text-white 
                    hover:bg-[#5588FF] transition-all flex items-center shadow-lg 
                    shadow-[#4477FF]/20 hover:shadow-[#5588FF]/30 hover:scale-105
                    active:scale-95 duration-200"
                  >
                    <ClipboardIcon className="h-5 w-5 mr-2" />
                    LOG WORKOUT
                  </Link>
                </div>

                {/* Track & Analysis Dropdown */}
                <div className="relative mr-6">
                  <button
                    onClick={() => handleDropdownClick('track')}
                    className={`${dropdownButtonClasses} ${openDropdown === 'track' ? 'after:w-full' : 'after:w-0'}`}
                  >
                    <ChartBarSquareIcon className="h-5 w-5 mr-2" />
                    TRACK & ANALYSIS
                    <ChevronDownIcon className={`h-4 w-4 ml-1 transform transition-transform duration-200 ${openDropdown === 'track' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={dropdownClasses(openDropdown === 'track')}>
                    <Link href="/history" className={dropdownItemClasses}>HISTORY</Link>
                    <Link href="/progress" className={dropdownItemClasses}>PROGRESS</Link>
                    <Link href="/records" className={dropdownItemClasses}>RECORDS</Link>
                    <Link href="/metrics" className={dropdownItemClasses}>METRICS</Link>
                  </div>
                </div>

                {/* Setup Dropdown */}
                <div className="relative mr-6">
                  <button
                    onClick={() => handleDropdownClick('setup')}
                    className={`${dropdownButtonClasses} ${openDropdown === 'setup' ? 'after:w-full' : 'after:w-0'}`}
                  >
                    <Cog6ToothIcon className="h-5 w-5 mr-2" />
                    SETUP
                    <ChevronDownIcon className={`h-4 w-4 ml-1 transform transition-transform duration-200 ${openDropdown === 'setup' ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={dropdownClasses(openDropdown === 'setup')}>
                    <Link href="/workout-days" className={dropdownItemClasses}>WORKOUT DAYS</Link>
                    <Link href="/exercises" className={dropdownItemClasses}>EXERCISES</Link>
                    <Link href="/goals" className={dropdownItemClasses}>GOALS</Link>
                  </div>
                </div>

                {/* Sign Out */}
                <button
                  onClick={() => signOut()}
                  className="rounded-md bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400 
                  hover:bg-red-500/20 hover:text-red-300 transition-all duration-200
                  hover:scale-105 active:scale-95"
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-md bg-[#4477FF] px-4 py-2.5 text-sm font-bold text-white 
                hover:bg-[#5588FF] transition-all shadow-lg shadow-[#4477FF]/20
                hover:scale-105 active:scale-95 duration-200"
              >
                SIGN IN
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 