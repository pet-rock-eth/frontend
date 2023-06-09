"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { goerli } from "wagmi/chains";
import { readContract, writeContract, waitForTransaction } from "@wagmi/core";
import { contractAddress, contractABI } from "../../contract/stone";
import { motion } from "framer-motion";

import { toast } from "react-toastify";
import CheckConnected from "../../components/checkConnected";
function showToast(
  msg: string,
  type: "success" | "error" | "info" | "warning" = "success"
) {
  toast[type](msg);
}
function InfoField({ label, value }: any) {
  return (
    <div className="flex gap-1 justify-between items-center">
      <div className="text-white font-bold">{label}</div>
      <div className="text-white text-opacity-80">{value}</div>
    </div>
  );
}
function FeedBtn({
  onClick,
  icon,
  text,
}: {
  onClick: any;
  icon: string;
  text: string;
}) {
  return (
    <button
      className="bg-white backdrop-blur-md bg-opacity-10 hover:bg-opacity-20 active:bg-opacity-30 rounded-[8px] p-2 shadow flex flex-col gap-2 items-center w-full group transition-all"
      onClick={onClick}
    >
      <i
        className={`bx ${icon} text-3xl group-hover:scale-125 transition-all`}
      ></i>{" "}
      {text}
    </button>
  );
}
function Rock({ rock }: any) {
  const [detail, setDetail] = useState(false);
  const [detailInfo, setDetailInfo] = useState<any>(null);
  const { address } = useAccount();
  async function getDetail() {
    let rockInfo: any = {};
    const rock_struct: any = await readContract({
      address: contractAddress,
      abi: contractABI,
      functionName: "get_struct",
      args: [rock.id],
      chainId: goerli.id,
    });
    rockInfo.adopt_time = new Date(
      Number(rock_struct.adopt_date_timestamp) * 1000
    );
    rockInfo.adopter_address = rock_struct.adopter_address;
    rockInfo.feed = Number(rock_struct.feed);
    rockInfo.healthPointPercentage_18digits = Number(
      rock_struct.healthPointPercentage_18digits
    );
    rockInfo.live_status = rock_struct.live_status;
    rockInfo.lock_status = rock_struct.lock_status;
    setDetailInfo(rockInfo);
  }
  useEffect(() => {
    if (detail) {
      getDetail();
    }
  }, [detail]);
  async function feed() {
    try {
      showToast(`請同意合約互動來餵食「${rock.name}」`, "info");
      const days = Math.floor(Math.random() * 5) + 1; // 1~5
      const { hash } = await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "feed",
        args: [rock.id, days, address],
        chainId: goerli.id,
      });
      setDetailInfo(null);
      await waitForTransaction({ hash });
      const yummy = ["好吃", "美味", "快樂", "開心"];
      const randomYummy = yummy[Math.floor(Math.random() * yummy.length)];
      showToast(`「${rock.name}」覺得${randomYummy}！`);
      getDetail();
    } catch (e) {
      console.log(e);
      //@ts-ignore
      if (e.toString().includes("ChainMismatchError")) {
        showToast("請切換到 Goerli 測試網", "error");
      }
      //@ts-ignore
      else if (e.toString().includes("TransactionExecutionError")) {
        showToast("請確認合約互動", "error");
      } else {
        showToast("餵食失敗", "error");
      }
    } finally {
      getDetail();
    }
  }
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
      <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-10">
        <motion.div
          className="absolute top-0 left-0 w-full h-full cursor-pointer bg-black bg-opacity-50"
          onClick={() => setDetail(!detail)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          key={rock.id}
          className="w-full max-w-[384px] flex flex-col gap-2 bg-white backdrop-blur-lg bg-opacity-10 rounded-[16px] m-2 p-2 relative"
          layout
          layoutId={`rock-${rock.id}`}
        >
          <motion.div
            className="absolute top-3 right-3 cursor-pointer text-xl bg-black bg-opacity-40 hover:bg-opacity-60  backdrop-blur-md flex items-center justify-center w-8 h-8 rounded-[4px] shadow"
            onClick={() => setDetail(!detail)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.4 }}
          >
            <i className="bx bx-x"></i>
          </motion.div>
          <motion.img
            src={rock.image}
            className="w-full rounded-[8px] shadow"
            layout
            layoutId={`rock-img-${rock.id}`}
          />
          <div className="flex flex-col gap-2">
            <motion.div
              className="flex gap-2 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FeedBtn icon="bx-cake" text="餵蛋糕" onClick={() => feed()} />
              <FeedBtn
                icon="bx-popsicle"
                text="餵冰棒"
                onClick={() => feed()}
              />
              <FeedBtn
                icon="bx-drink"
                text="餵雞尾酒"
                onClick={() => showToast(`${rock.name} 醉了`, `info`)}
              />
            </motion.div>
            <div>
              <motion.span
                className="text-white text-2xl font-bold"
                layout
                layoutId={`rock-name-${rock.id}`}
              >
                {rock.name}
              </motion.span>
            </div>
            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div>{rock.description}</div>
              {detailInfo ? (
                <motion.div>
                  <InfoField label="feed" value={detailInfo.feed} />
                  <InfoField
                    label="healthPoint"
                    value={detailInfo.healthPointPercentage_18digits}
                  />
                  <InfoField label="石頭編號 #" value={rock.id} />
                  <InfoField
                    label="領養時間"
                    value={detailInfo.adopt_time.toLocaleString()}
                  />
                  <InfoField
                    label="鎖定狀態"
                    value={detailInfo.lock_status ? `是` : `否`}
                  />
                  <InfoField
                    label="存活狀態"
                    value={detailInfo.live_status ? `還沒掛` : `掰了`}
                  />
                </motion.div>
              ) : (
                <motion.div className="flex justify-center items-center h-[144px]">
                  <i className="bx bx-loader-alt animate-spin text-4xl"></i>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  ) : (
    <motion.div
      key={rock.id}
      className="flex flex-col gap-2 justify-center items-center bg-white backdrop-blur-md bg-opacity-10 rounded-[16px] m-2 p-2 cursor-pointer relative"
      layout
      layoutId={`rock-${rock.id}`}
      onClick={() => setDetail(!detail)}
    >
      <motion.img
        src={rock.image}
        className="w-full rounded-[8px] shadow"
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
      let ids = data.map((x) => Number(x)).filter((x) => x > 0);
      await Promise.all(
        //@ts-ignore
        ids.map(async (id) => {
          let rockInfo: any = {};
          if (localStorage.getItem(`rock-${id}`)) {
            rockInfo = JSON.parse(localStorage.getItem(`rock-${id}`) || "{}");
          } else {
            const res = await fetch(
              `https://ipfs.io/ipfs/bafybeibkrtttj2mtjmuwu26l7dlbmvt5k5qgah7qxmhobv3ps5j232tzdy/stone${id}.json`
            );
            rockInfo = await res.json();
            localStorage.setItem(`rock-${id}`, JSON.stringify(data));
          }
          return rockInfo;
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
        ) : rocks.length === 0 ? (
          <div className="mt-2 text-center">你還沒有石頭喔</div>
        ) : (
          <div className="container">
            <div className="mt-4 grid gap-2 grid-cols-[repeat(auto-fill,minmax(128px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(256px,1fr))]">
              {rocks.map((rock: any) => (
                <Rock rock={rock} key={rock.id} />
              ))}
            </div>
          </div>
        )}
      </CheckConnected>
    </>
  );
}
