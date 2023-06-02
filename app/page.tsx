"use client";
import { useState } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { goerli } from "wagmi/chains";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { contractAddress, contractABI } from "../contract/stone";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
export default function Home() {
  const { open: openWeb3Modal, isOpen: isWeb3ModalOpen } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const [minting, setMinting] = useState(false);
  function showToast(
    msg: string,
    type: "success" | "error" | "info" | "warning" = "success"
  ) {
    toast[type](msg);
  }
  async function mintStone() {
    setMinting(true);
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "mint",
        args: [address],
        chainId: goerli.id,
      });
      const data = await waitForTransaction({ hash });
      console.log(data);
      showToast("鑄造成功");
    } catch (e) {
      console.log(e);
      //@ts-ignore
      if (e.toString().includes("ChainMismatchError")) {
        showToast("請切換到 Goerli 測試網", "error");
      }
      //@ts-ignore
      else if (e.toString().includes("TransactionExecutionError")) {
        showToast("請允許合約鑄造", "error");
      } else {
        showToast("鑄造失敗", "error");
      }
    } finally {
      setMinting(false);
    }
  }
  return (
    <div>
      <img src="/rock.png" className="w-40 mx-auto mt-16" />
      <h1 className="text-4xl text-center mt-4 font-bold">來自區塊鏈的</h1>
      <h1 className="text-6xl text-center mt-2 font-bold">寵物石頭</h1>
      <div className="flex justify-center mt-8">
        {isConnected ? (
          minting ? (
            <motion.a
              className="flex items-center gap-2 px-8 py-6 rounded-xl text-2xl cursor-pointer bg-blue-500 bg-opacity-10  shadow-lg ring-1 ring-white ring-opacity-10"
              layout
              layoutId="main-btn"
            >
              <i className="bx bx-loader-alt animate-spin"></i> 鑄造中...
            </motion.a>
          ) : (
            <motion.a
              className="flex items-center gap-2 px-8 py-6 rounded-xl text-2xl cursor-pointer shadow-lg bg-blue-500 bg-opacity-20 hover:bg-opacity-40 transition-colors"
              onClick={(e) => mintStone()}
              layout
              layoutId="main-btn"
              whileHover={{
                scale: 1.1,
              }}
              whileTap={{
                scale: 0.9,
              }}
            >
              鑄造石頭
            </motion.a>
          )
        ) : (
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
        )}
      </div>
    </div>
  );
}
