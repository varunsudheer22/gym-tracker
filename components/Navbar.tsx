import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  HomeIcon,
  FireIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  TrophyIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  PlusCircleIcon,
  CalendarIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  BookmarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  items?: NavItem[];
  description?: string;
}

const navigation: NavItem[] = [
  {
    label: 'Home',
    href: '/',
    icon: HomeIcon,
    description: 'Your workout dashboard'
  },
  {
    label: 'Train',
    icon: FireIcon,
    description: 'Start and manage workouts',
    items: [
      { 
        label: 'Start Workout', 
        href: '/start-workout',
        icon: PlusCircleIcon,
        description: 'Begin a new workout session'
      },
      { 
        label: 'Log Workout', 
        href: '/log-workout',
        icon: ClipboardDocumentListIcon,
        description: 'Record your workout details'
      },
      { 
        label: 'Workout History', 
        href: '/history',
        icon: ClockIcon,
        description: 'View past workouts'
      }
    ]
  },
  {
    label: 'Plan',
    icon: CalendarIcon,
    description: 'Organize your training',
    items: [
      { 
        label: 'Workout Days', 
        href: '/workout-days',
        icon: CalendarIcon,
        description: 'Manage your workout schedule'
      },
      { 
        label: 'Exercise Library', 
        href: '/exercises',
        icon: BookmarkIcon,
        description: 'Browse and manage exercises'
      }
    ]
  },
  {
    label: 'Track',
    icon: ChartBarIcon,
    description: 'Monitor your progress',
    items: [
      { 
        label: 'Goals', 
        href: '/goals',
        icon: ArrowTrendingUpIcon,
        description: 'Set and track your goals'
      },
      { 
        label: 'Body Metrics', 
        href: '/body-metrics',
        icon: UserIcon,
        description: 'Track body measurements'
      },
      { 
        label: 'Records', 
        href: '/personal-records',
        icon: TrophyIcon,
        description: 'View your personal bests'
      }
    ]
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (href: string) => pathname === href;

  const handleDropdownClick = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <FireIcon className="h-8 w-8 text-orange-500" />
              <span className="ml-2 text-xl font-bold text-white">GymTracker</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navigation.map((item) => (
                <div key={item.label} className="relative group">
                  {item.href ? (
                    <Link
                      href={item.href}
                      className={`
                        inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                        transition-colors duration-150 ease-in-out
                        ${isActive(item.href)
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                      {item.label}
                    </Link>
                  ) : (
                    <div>
                      <button
                        onClick={() => handleDropdownClick(item.label)}
                        className={`
                          inline-flex items-center px-4 py-2 text-sm font-medium rounded-md
                          transition-colors duration-150 ease-in-out
                          ${openDropdown === item.label
                            ? 'bg-orange-500 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        {item.icon && <item.icon className="h-5 w-5 mr-2" />}
                        {item.label}
                        <ChevronDownIcon className={`
                          ml-2 h-4 w-4 transition-transform duration-200
                          ${openDropdown === item.label ? 'transform rotate-180' : ''}
                        `} />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === item.label && item.items && (
                        <div className="absolute left-0 mt-2 w-64 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5">
                          <div className="py-1" role="menu">
                            {item.items.map((subItem) => (
                              <Link
                                key={subItem.label}
                                href={subItem.href || '#'}
                                className={`
                                  group flex items-center px-4 py-3 text-sm
                                  ${isActive(subItem.href || '')
                                    ? 'bg-orange-500 text-white'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                  }
                                `}
                                role="menuitem"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <div className="flex items-center">
                                  {subItem.icon && (
                                    <subItem.icon className="h-5 w-5 mr-3" />
                                  )}
                                  <div>
                                    <div className="font-medium">{subItem.label}</div>
                                    {subItem.description && (
                                      <div className="mt-0.5 text-xs opacity-75">
                                        {subItem.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-md transition-colors duration-150 ease-in-out"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
              Sign Out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setOpenDropdown(openDropdown ? null : 'mobile')}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {openDropdown === 'mobile' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {openDropdown === 'mobile' && (
        <div className="sm:hidden bg-slate-900">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <div key={item.label}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`
                      block px-3 py-2 rounded-md text-base font-medium
                      ${isActive(item.href)
                        ? 'bg-orange-500 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                    `}
                    onClick={() => setOpenDropdown(null)}
                  >
                    <div className="flex items-center">
                      {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                      <div>
                        <div>{item.label}</div>
                        {item.description && (
                          <div className="mt-0.5 text-xs opacity-75">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleDropdownClick(item.label)}
                      className={`
                        w-full text-left px-3 py-2 rounded-md text-base font-medium
                        ${openDropdown === item.label
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {item.icon && <item.icon className="h-5 w-5 mr-3" />}
                          <div>
                            <div>{item.label}</div>
                            {item.description && (
                              <div className="mt-0.5 text-xs opacity-75">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronDownIcon className={`
                          h-5 w-5 transition-transform duration-200
                          ${openDropdown === item.label ? 'transform rotate-180' : ''}
                        `} />
                      </div>
                    </button>
                    {openDropdown === item.label && item.items && (
                      <div className="pl-4 mt-2 space-y-2">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.label}
                            href={subItem.href || '#'}
                            className={`
                              block px-3 py-2 rounded-md text-base font-medium
                              ${isActive(subItem.href || '')
                                ? 'bg-orange-500 text-white'
                                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                              }
                            `}
                            onClick={() => setOpenDropdown(null)}
                          >
                            <div className="flex items-center">
                              {subItem.icon && <subItem.icon className="h-5 w-5 mr-3" />}
                              <div>
                                <div>{subItem.label}</div>
                                {subItem.description && (
                                  <div className="mt-0.5 text-xs opacity-75">
                                    {subItem.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <button
              onClick={() => signOut()}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <div className="flex items-center">
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign Out
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 