import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

import { useWeb3Modal } from "@web3modal/react";
import { useAccount } from "wagmi";
function NavItem({
  href,
  children,
  name,
}: {
  href: string;
  children: React.ReactNode;
  name?: string;
}) {
  const pathname = usePathname();
  const current = pathname === href;
  return (
    <Link
      href={href}
      className={`relative p-1 lg:p-2 text-sm lg:text-xl ${
        current
          ? "text-white font-bold"
          : "text-white text-opacity-70 hover:text-opacity-90"
      }`}
    >
      {current && (
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 left-0 w-full h-full bg-white bg-opacity-10 rounded-xl"
        />
      )}

      <motion.span className="relative flex justify-center items-center gap-2">
        {children}
        <motion.span>{name}</motion.span>
      </motion.span>
    </Link>
  );
}
export default function Nav() {
  const { open: openWeb3Modal, isOpen: isWeb3ModalOpen } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const pathname = usePathname();
  return (
    <>
      <nav className="">
        <div className="container mx-auto px-6 py-2 flex justify-center items-center">
          <NavItem href="/" name="寵物石頭">
            <i className="bx bx-home-alt"></i>
          </NavItem>
          <NavItem href="/my-rock/" name="我ㄉ">
            <i className="bx bx-user"></i>
          </NavItem>
          {/* <NavItem href="/school/" name="學校">
            <i className="bx bxs-school"></i>
          </NavItem>
          <NavItem href="/columbarium/" name="靈骨塔">
            <i className="bx bx-ghost"></i>
          </NavItem> */}
          <div className="flex-1" />
          <a
            className="items-center gap-2 p-1 lg:p-2 rounded-xl text-sm lg:text-xl cursor-pointer
          hover:bg-white hover:bg-opacity-10 flex"
            onClick={(e) => openWeb3Modal()}
          >
            {isConnected ? (
              <i className="bx bx-user"></i>
            ) : (
              <i className="bx bx-wallet"></i>
            )}
            {isConnected ? (
              <>
                <span className="lg:hidden">錢包</span>
                <span className="hidden lg:inline">
                  {" "}
                  {address?.slice(0, 6)}...{address?.slice(-6)}
                </span>
              </>
            ) : isWeb3ModalOpen ? (
              <span>正在連接...</span>
            ) : (
              <span>連接錢包</span>
            )}
          </a>
        </div>
      </nav>
    </>
  );
}
