"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { motion } from "framer-motion"

import { useWeb3Modal } from "@web3modal/react";
import { useAccount } from 'wagmi'
function NavItem({
  href, children
}: {
  href: string,
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const current = pathname === href
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-xl ${current ? 'text-white font-bold' : 'text-white text-opacity-70 hover:text-opacity-90'}`}
    >
      {
        current &&
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 left-0 w-full h-full bg-white bg-opacity-10 rounded-xl"
        />
      }
      <span className='relative'>
        {children}
      </span>
    </Link>
  )
}
export default function Nav() {
  const { open: openWeb3Modal, isOpen: isWeb3ModalOpen } = useWeb3Modal();
  const { address, isConnected } = useAccount()
  return (
    <>
      <nav className="">
        <div className="container mx-auto px-6 py-2 flex justify-center items-center">
          <NavItem href='/'>寵物石頭</NavItem>
          <NavItem href='/my-rock'>我ㄉ石頭</NavItem>
          <NavItem href='/school'>石頭學校</NavItem>
          <NavItem href='/columbarium'>石頭靈骨塔</NavItem>
          <div className='flex-1' />
          <a className="flex items-center gap-2 px-3 py-2 rounded-xl text-xl cursor-pointer
          hover:bg-white hover:bg-opacity-10"
            onClick={e => openWeb3Modal()}>
            {isConnected ? <i className='bx bx-user' ></i> : <i className='bx bx-wallet' ></i>}
            {isConnected ? <span>{address?.slice(0, 6)}...{address?.slice(-6)}</span> :
              isWeb3ModalOpen ? <span>正在連接...</span> :
                <span>連接錢包</span>}
          </a>
        </div>
      </nav>
    </>
  )
}
