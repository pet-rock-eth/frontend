"use client";
import { useState } from "react";
import { useWeb3Modal } from "@web3modal/react";
import { useAccount } from "wagmi";
import { goerli } from "wagmi/chains";
import { writeContract, waitForTransaction, readContract } from "@wagmi/core";
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
      const rock_left: any = Number(
        await readContract({
          address: contractAddress,
          abi: contractABI,
          functionName: "left_stone_number",
          chainId: goerli.id,
        })
      );
      if (rock_left <= 0) {
        showToast("石頭已售完", "error");
        return;
      }
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
      <motion.img
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        src="/rock.png"
        className="w-40 mx-auto mt-16"
      />
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl text-center mt-4 font-bold"
      >
        來自區塊鏈的
      </motion.h1>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-6xl text-center mt-2 font-bold"
      >
        寵物石頭
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center mt-8"
      >
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
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="container mx-auto my-16"
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div>
            <i className="bx bx-star text-6xl"></i>
            <h2 className="text-2xl font-bold mt-1">你的第一個區塊鏈石頭</h2>
            <div className="mt-1">
              來養你的第一顆區塊鏈石頭吧！購買後，你將擁有一顆獨一無二的石頭，並且可以在區塊鏈上查看它的所有權。
            </div>
          </div>
          <div>
            <i className="bx bx-dish text-6xl"></i>
            <h2 className="text-2xl font-bold mt-1">餵食石頭</h2>
            <div className="mt-1">
              石頭必須定期餵食才能維持生命，必須小心呵護，才能成長茁壯，失去照顧的石頭可能會死掉。
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
      </motion.div>
    </div>
  );
}
