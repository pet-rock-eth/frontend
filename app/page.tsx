"use client";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount } from 'wagmi'

export default function Home() {
  const { open: openWeb3Modal, isOpen: isWeb3ModalOpen } = useWeb3Modal();
  const { address, isConnected } = useAccount()
  return (
    <div>
      <img src="/rock.png" className="w-40 mx-auto mt-16" />
      <h1 className="text-4xl text-center mt-4 font-bold">來自區塊鏈的</h1>
      <h1 className="text-6xl text-center mt-2 font-bold">寵物石頭</h1>
      <div className="flex justify-center mt-8">
        {
          isConnected
            ? <a className="flex items-center gap-2 px-8 py-6 rounded-xl text-2xl cursor-pointer shadow-lg
          bg-blue-500 bg-opacity-20 hover:bg-opacity-40" >
              鑄造石頭
            </a>
            : <a className="flex items-center gap-2 px-8 py-3 rounded-xl text-2xl cursor-pointer shadow-lg
            bg-blue-500 bg-opacity-20 hover:bg-opacity-40"
              onClick={e => openWeb3Modal()}>
              <i className='bx bx-wallet' ></i>
              {isWeb3ModalOpen ? <span>正在連接...</span> :
                <span>連接錢包</span>}
            </a>
        }
      </div>
    </div>
  )
}
