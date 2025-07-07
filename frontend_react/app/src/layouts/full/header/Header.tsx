import { useState, useEffect } from "react";

import { Drawer, Navbar } from "flowbite-react";
import MobileSidebar from "../sidebar/MobileSidebar";
import Profile from "./Profile";

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);

  return (
    <header
      className={`sticky top-0 z-[5] ${isSticky ? "bg-lightgray dark:bg-dark fixed w-full" : "bg-lightgray dark:bg-dark"}`}
    >
      <Navbar
        fluid
        className="rounded-none bg-transparent dark:bg-transparent py-4 sm:px-30 px-4"
      >
        <div className="flex gap-3 items-center justify-between w-full">
          <div className="flex gap-2 items-center">
            <span
              onClick={() => setIsOpen(true)}
              className="h-10 w-10 flex text-black dark:text-white text-opacity-65 xl:hidden hover:text-primary hover:bg-lightprimary rounded-full justify-center items-center cursor-pointer"
            >
              {/* Hamburger icon can be added here */}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <Profile />
          </div>
        </div>
      </Navbar>
      <Drawer open={isOpen} onClose={handleClose} className="w-130">
        <Drawer.Items>
          <MobileSidebar />
        </Drawer.Items>
      </Drawer>
    </header>
  );
};

export default Header;