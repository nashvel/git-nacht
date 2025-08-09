import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, ArrowRightIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-20 bg-gray-900 shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 opacity-30 blur-3xl"></div>
      <nav className="relative container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">Git Nacht</Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLink to="/features">Features</NavLink>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <button onClick={handleLogout} className="flex items-center text-sm font-medium text-gray-200 hover:text-white">
                Sign Out <ArrowRightIcon className="ml-1 w-4 h-4" />
              </button>
            </>
          ) : (
            <Link to="/signin" className="flex items-center text-sm font-medium text-gray-200 hover:text-white">
              Sign In <ArrowRightIcon className="ml-1 w-4 h-4" />
            </Link>
          )}
          <Link to="/signup" className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-200 transition-colors">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-gray-700 focus:outline-none">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
            </Menu.Button>
            <Transition
              as={React.Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 divide-y divide-gray-700 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  <Menu.Item><NavLinkMobile to="/features">Features</NavLinkMobile></Menu.Item>
                </div>
                <div className="px-1 py-1">
                  {user ? (
                    <>
                      <Menu.Item><NavLinkMobile to="/dashboard">Dashboard</NavLinkMobile></Menu.Item>
                      <Menu.Item>
                        <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">
                          Sign Out
                        </button>
                      </Menu.Item>
                    </>
                  ) : (
                    <Menu.Item><NavLinkMobile to="/signin">Sign In</NavLinkMobile></Menu.Item>
                  )}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </nav>
    </header>
  );
};

const NavLink = ({ to, children }) => (
  <Link to={to} className="text-sm font-medium text-gray-200 hover:text-white">{children}</Link>
);

const NavLinkMobile = ({ to, children }) => (
  <Link to={to} className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">{children}</Link>
);

export default Header;
