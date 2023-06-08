"use client";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { goerli } from "wagmi/chains";
import { writeContract, waitForTransaction, readContract } from "@wagmi/core";
import { contractAddress, contractABI } from "../../contract/stone";
import { motion } from "framer-motion";
export default function MyRock() {
  const { address, isConnected } = useAccount();
  const { open: openWeb3Modal, isOpen: isWeb3ModalOpen } = useWeb3Modal();
  const [rocks, setRocks] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);
  async function getRocks() {
    if (!isConnected) return;
    setLoading(true);
    const data = await readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "findstone",
      args: [address],
      chainId: goerli.id,
    });
    //@ts-ignore
    let ids = data.map((x) => parseInt(x)).filter((x) => x > 0);
    //https://ipfs.io/ipfs/bafybeibkrtttj2mtjmuwu26l7dlbmvt5k5qgah7qxmhobv3ps5j232tzdy/stone{id}.json
    await Promise.all(
      //@ts-ignore
      ids.map(async (id) => {
        const res = await fetch(
          `https://ipfs.io/ipfs/bafybeibkrtttj2mtjmuwu26l7dlbmvt5k5qgah7qxmhobv3ps5j232tzdy/stone${id}.json`
        );
        const data = await res.json();
        return data;
      })
    ).then((data) => setRocks(data));
    console.log(rocks);
    setLoading(false);
  }
  useEffect(() => {
    getRocks();
  }, [isConnected]);
  return (
    <>
      <h1 className="text-4xl text-center mt-2">我ㄉ石頭</h1>

      {isConnected ? (
        loading ? (
          <div className="flex justify-center items-center h-[512px]">
            <i className="bx bx-loader-alt animate-spin text-4xl"></i>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center mt-4">
            {rocks.map((rock: any) => (
              <div
                key={rock.id}
                className="flex flex-col justify-center items-center bg-white bg-opacity-10 rounded-[16px] m-2 p-2"
              >
                <img
                  src={rock.image}
                  className="w-32 h-32 lg:w-64 lg:h-64 rounded-[8px]"
                />
                <div className="text-white text-opacity-80 text-center mt-2">
                  {rock.name}
                </div>
              </div>
            ))}
          </div>
        )
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
            連接錢包來查看石頭
          </h1>
        </div>
      )}
    </>
  );
}
