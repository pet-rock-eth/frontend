"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation';
import { motion } from "framer-motion"
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
      className={`relative px-3 py-2 text-xl ${current ? 'text-white font-bold' : 'text-gray-500 hover:text-gray-900'}`}
    >
      {
        current &&
        <motion.div
          layoutId="underline"
          className="absolute bottom-0 left-0 w-full h-full bg-gray-900 rounded-xl"
        />
      }
      <span className='relative'>
        {children}
      </span>
    </Link>
  )
}
export default function Nav() {
  return (
    <>
      <nav className="">
        <div className="container mx-auto px-6 py-2 flex justify-center items-center">
          <NavItem href='/'>寵物石頭</NavItem>
          <NavItem href='/school'>學校</NavItem>
          <NavItem href='/columbarium'>靈骨塔</NavItem>
          <NavItem href='/my-rock'>我ㄉ石頭</NavItem>
          <div className='flex-1' />
        </div>
      </nav>
    </>
  )
}
