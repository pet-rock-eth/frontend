"use client";
import { useAccount } from "wagmi";
import { useWeb3Modal } from "@web3modal/react";
import { useEffect, useState } from "react";
import { goerli } from "wagmi/chains";
import { readContract } from "@wagmi/core";
import { contractAddress, contractABI } from "../../contract/stone";
import CheckConnected from "../../components/checkConnected";
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
      <CheckConnected>
        {loading ? (
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
        )}
      </CheckConnected>
    </>
  );
}
