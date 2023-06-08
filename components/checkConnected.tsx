"use client";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { motion } from "framer-motion";
export default function CheckConnected({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isConnected } = useAccount();
  const { open: openWeb3Modal, isOpen: isWeb3ModalOpen } = useWeb3Modal();
  return (
    <>
      {isConnected ? (
        children
      ) : (
        <div className="flex flex-col flex-wrap justify-center items-center mt-8">
          <motion.a
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-2xl cursor-pointer shadow-lg
            bg-blue-500 bg-opacity-20 hover:bg-opacity-40"
            onClick={(e) => openWeb3Modal()}
            layout
            layoutId="main-btn"
          >
            <i className="bx bx-wallet"></i>
            {isWeb3ModalOpen ? <span>正在連接...</span> : <span>連接錢包</span>}
          </motion.a>
          <h1 className="text-white text-opacity-80 text-center my-2">
            連接錢包來查看此頁面
          </h1>
        </div>
      )}
    </>
  );
}
