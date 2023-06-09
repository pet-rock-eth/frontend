"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { goerli } from "wagmi/chains";
import { readContract, writeContract } from "@wagmi/core";
import { contractAddress, contractABI } from "../../contract/stone";
import { motion } from "framer-motion";
import CheckConnected from "../../components/checkConnected";
function Rock({ rock }: any) {
  const [detail, setDetail] = useState(false);
  return detail ? (
    <>
      <div
        className="flex flex-col justify-center items-center bg-white bg-opacity-0 rounded-[16px] m-2 p-2 cursor-pointer"
        onClick={() => setDetail(!detail)}
      >
        <div className="w-32 h-32 lg:w-64 lg:h-64 rounded-[8px]"></div>
        <motion.div className="text-white text-opacity-0 mt-2 select-none">
          stone 石頭
        </motion.div>
      </div>
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-10">
        <motion.div
          className="absolute top-0 left-0 w-full h-full cursor-pointer"
          onClick={() => setDetail(!detail)}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
        ></motion.div>
        <motion.div
          key={rock.id}
          className="flex flex-col gap-2 bg-white backdrop-blur-md bg-opacity-10 rounded-[16px] m-2 p-2 relative"
          layout
          layoutId={`rock-${rock.id}`}
        >
          <motion.div
            className="absolute top-3 right-3 cursor-pointer text-xl bg-black bg-opacity-40 hover:bg-opacity-60  backdrop-blur-md flex items-center justify-center w-8 h-8 rounded-[4px] shadow"
            onClick={() => setDetail(!detail)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
          >
            <i className="bx bx-x"></i>
          </motion.div>
          <motion.img
            src={rock.image}
            className="w-64 h-64 rounded-[8px] shadow"
            layout
            layoutId={`rock-img-${rock.id}`}
          />
          <button className="bg-white backdrop-blur-md bg-opacity-10 hover:bg-opacity-20 active:bg-opacity-30 rounded-[8px] p-2 shadow">
            <i className="bx bx-baguette"></i> 餵食
          </button>
          <div className="min-w-[256px] flex flex-col gap-2">
            <div>
              <motion.span
                className="text-white text-2xl font-bold"
                layout
                layoutId={`rock-name-${rock.id}`}
              >
                {rock.name}
              </motion.span>
            </div>
            <div>{rock.description}</div>
          </div>
        </motion.div>
      </div>
    </>
  ) : (
    <motion.div
      key={rock.id}
      className="flex flex-col gap-2 justify-center items-center bg-white backdrop-blur-md bg-opacity-10 rounded-[16px] m-2 p-2 cursor-pointer"
      layout
      layoutId={`rock-${rock.id}`}
      onClick={() => setDetail(!detail)}
    >
      <motion.img
        src={rock.image}
        className="w-32 h-32 lg:w-64 lg:h-64 rounded-[8px] shadow"
        layout
        layoutId={`rock-img-${rock.id}`}
      />
      <motion.div
        className="text-white text-opacity-80"
        layout
        layoutId={`rock-name-${rock.id}`}
      >
        {rock.name}
      </motion.div>
    </motion.div>
  );
}
export default function MyRock() {
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
              <Rock rock={rock} key={rock.id} />
            ))}
          </div>
        )}
      </CheckConnected>
    </>
  );
}
