"use client";
import { useState } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount } from "wagmi";
import { goerli } from "wagmi/chains";
import { writeContract, waitForTransaction } from "@wagmi/core";
import { contractAddress, contractABI } from "../contract/stone";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
export default function Home() {
  const router = useRouter();
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
      router.push("/my-rock/");
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
      <div className="container mx-auto mt-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <i className="bx bx-star text-6xl"></i>
            <h2 className="text-2xl font-bold mt-1">你的第一個區塊鏈石頭</h2>
            <div className="mt-1">
              來養你的第一顆區塊鏈石頭吧！石頭是一種
              NFT，你可以在區塊鏈上查看石頭的所有權，並且在市場上交易。
            </div>
          </div>
          <div>
            <i className="bx bx-dish text-6xl"></i>
            <h2 className="text-2xl font-bold mt-1">餵食石頭</h2>
            <div className="mt-1">
              石頭必須定期餵食才能維持生命，你可以在石頭的詳細資料頁面看到石頭的活力值，活力值會隨著時間流逝而降低，當活力值過低時，石頭可能會死亡。
            </div>
          </div>
          <div>
            <i className="bx bx-cuboid text-6xl"></i>

            <h2 className="text-2xl font-bold mt-1">獨一無二</h2>
            <div className="mt-1">
              每個石頭都是獨一無二的，他們有著獨特的名字和生世背景，你可以在鑄造後看到相關內容。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
