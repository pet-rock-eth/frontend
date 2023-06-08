"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { goerli } from "wagmi/chains";
import { readContract } from "@wagmi/core";
import { contractAddress, contractABI } from "../../contract/stone";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import CheckConnected from "../../components/checkConnected";
export default function MyRock() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [rocks, setRocks] = useState<object[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
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
      await Promise.all(
        //@ts-ignore
        ids.map(async (id) => {
          if (localStorage.getItem(`rock-${id}`)) {
            return JSON.parse(localStorage.getItem(`rock-${id}`) || "{}");
          }
          const res = await fetch(
            `https://ipfs.io/ipfs/bafybeibkrtttj2mtjmuwu26l7dlbmvt5k5qgah7qxmhobv3ps5j232tzdy/stone${id}.json`
          );
          const data = await res.json();
          localStorage.setItem(`rock-${id}`, JSON.stringify(data));
          return data;
        })
      ).then((data) => setRocks(data));
      setLoading(false);
    }
    getRocks();
  }, [isConnected]);
  return (
    <>
      <h1 className="text-4xl text-center mt-2">我ㄉ石頭</h1>
      <CheckConnected>
        {loading ? (
          <div className="flex justify-center items-center h-[512px]">
            <i className="bx bx-loader-alt animate-spin text-4xl"></i>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center mt-4">
            {rocks.map((rock: any) => (
              <motion.div
                key={rock.id}
                className="flex flex-col justify-center items-center bg-white bg-opacity-10 rounded-[16px] m-2 p-2 cursor-pointer"
                layout
                layoutId={`rock-${rock.id}`}
              >
                <motion.img
                  src={rock.image}
                  className="w-32 h-32 lg:w-64 lg:h-64 rounded-[8px]"
                  layout
                  layoutId={`rock-img-${rock.id}`}
                />
                <motion.div
                  className="text-white text-opacity-80 text-center mt-2"
                  layout
                  layoutId={`rock-name-${rock.id}`}
                >
                  {rock.name}
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </CheckConnected>
    </>
  );
}
