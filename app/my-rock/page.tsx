"use client";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { goerli } from "wagmi/chains";
import { readContract, writeContract, waitForTransaction } from "@wagmi/core";
import { contractAddress, contractABI } from "../../contract/stone";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";
import { parseEther } from "ethers/lib/utils";
import { toast } from "react-toastify";
import CheckConnected from "../../components/checkConnected";
function showToast(
  msg: string,
  type: "success" | "error" | "info" | "warning" = "success"
) {
  toast[type](msg);
}
function InfoField({ label, value, children }: any) {
  return (
    <div className="flex gap-1 justify-between items-center">
      <div className="text-white font-bold">{label}</div>
      <div className="text-white text-opacity-80">{children || value}</div>
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
async function getRockDetail(id: string) {
  let rockInfo: any = {};
  const rock_struct: any = await readContract({
    address: contractAddress,
    abi: contractABI,
    functionName: "get_struct",
    args: [id],
    chainId: goerli.id,
  });
  rockInfo.adopt_time = new Date(
    Number(rock_struct.adopt_date_timestamp) * 1000
  );
  rockInfo.adopter_address = rock_struct.adopter_address;
  rockInfo.feed = Number(rock_struct.feed) / 1e18 / 86400;
  rockInfo.healthPointPercentage_18digits = Number(
    rock_struct.healthPointPercentage_18digits
  );
  rockInfo.live_status = rock_struct.live_status;
  rockInfo.lock_status = rock_struct.lock_status;
  rockInfo.alive_percent =
    Math.floor(
      ((rockInfo.adopt_time.getTime() +
        (rockInfo.feed + 3) * 86400 * 1000 -
        Date.now()) /
        (7 * 86400 * 1000)) *
        10000
    ) / 100;

  if (rockInfo.alive_percent > 100) rockInfo.alive_percent = 100;
  if (!rockInfo.live_status) rockInfo.alive_percent = 0;
  return rockInfo;
}
function Rock({ rock }: any) {
  const [detail, setDetail] = useState(false);
  const [detailInfo, setDetailInfo] = useState<any>(null);
  const { address } = useAccount();
  const zIndex = useMotionValue(0);
  async function getDetail() {
    setDetailInfo(await getRockDetail(rock.id));
  }
  useEffect(() => {
    if (detail) {
      getDetail();
      zIndex.set(20);
    } else {
      setTimeout(() => {
        if (!detail) {
          zIndex.set(0);
        }
      }, 250);
    }
  }, [detail]);
  async function feed() {
    if (detailInfo.alive_percent >= 100) {
      return showToast(`「${rock.name}」已經很飽了`, "info");
    }
    try {
      showToast(`請同意合約互動來餵食「${rock.name}」`, "info");
      const days = Math.floor(Math.random() * 3) + 1; // 1~3
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
  async function die() {
    try {
      const { hash } = await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "die",
        args: [rock.id],
        chainId: goerli.id,
      });
      setDetailInfo(null);
      await waitForTransaction({ hash });
      showToast(`「${rock.name}」覺得解脫了！`, "success");
      getDetail();
    } catch (e) {
      showToast("失敗", "error");
    }
  }
  async function unlock() {
    if (
      confirm(
        `解鎖的目的是為了讓你可以轉移「${rock.name}」，並在 NFT 市場上出售，確定要解鎖嗎？`
      )
    ) {
      // unlock_payment
      try {
        showToast(`請同意合約互動來解鎖「${rock.name}」`, "info");
        const { hash } = await writeContract({
          address: contractAddress,
          abi: contractABI,
          functionName: "unlock_payment",
          args: [rock.id],
          chainId: goerli.id,
          //@ts-ignore
          value: parseEther("0.001"),
        });
        setDetailInfo(null);
        await waitForTransaction({ hash });
        showToast(`已解鎖「${rock.name}」`);
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
          showToast("解鎖失敗", "error");
        }
      } finally {
        getDetail();
      }
    }
  }
  async function transfer() {
    // TransferSingle
    let to = prompt(`請輸入欲轉移的地址，注意：轉移後無法再轉回！`);
    if (!to) return showToast("轉移已取消", "info");
    try {
      showToast(`請同意合約互動來轉移「${rock.name}」`, "info");
      const { hash } = await writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: "safeTransferFrom",
        args: [address, to, rock.id, 1, "0x0"],
        chainId: goerli.id,
      });
      setDetailInfo(null);
      await waitForTransaction({ hash });
      showToast(`已轉移「${rock.name}」`);
      location.reload();
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
        showToast("解鎖失敗", "error");
      }
    } finally {
      getDetail();
    }
  }
  return detail ? (
    <>
      <div
        className="flex flex-col justify-center items-center bg-opacity-0 rounded-[16px] m-2 p-2 cursor-pointer"
        onClick={() => setDetail(!detail)}
      >
        <div className="w-32 h-32 lg:w-64 lg:h-64 rounded-[8px]"></div>
        <motion.div className="text-white text-opacity-0 mt-2 select-none">
          stone 石頭
        </motion.div>
      </div>
      <motion.div
        className="fixed top-0 left-0 w-full h-full flex justify-center items-center"
        style={{ zIndex }}
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-full cursor-pointer bg-black bg-opacity-50"
          onClick={() => setDetail(!detail)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          key={rock.id}
          className="w-full max-w-[384px] flex flex-col gap-2 bg-[#194d63] bg-opacity-50 backdrop-blur-lg rounded-[16px] m-2 p-2 relative overflow-y-auto max-h-[calc(100vh-4rem)]"
          layout
          layoutId={`rock-${rock.id}`}
        >
          <motion.div
            className="absolute top-3 right-3 cursor-pointer text-xl bg-black bg-opacity-40 hover:bg-opacity-60  backdrop-blur-md flex items-center justify-center w-8 h-8 rounded-[4px] shadow z-20"
            onClick={() => setDetail(!detail)}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.4 }}
          >
            <i className="bx bx-x"></i>
          </motion.div>
          <motion.img
            src={rock.image}
            className={`w-full rounded-[8px] shadow aspect-square ${
              detailInfo?.live_status ?? rock.live_status
                ? ``
                : `contrast-50 grayscale`
            }`}
            layout
            layoutId={`rock-img-${rock.id}`}
          />
          <div className="flex flex-col gap-2">
            {detailInfo && detailInfo.live_status && (
              <motion.div
                className="flex gap-2 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {detailInfo.alive_percent >= 0.5 ? (
                  <>
                    <FeedBtn
                      icon="bx-cake"
                      text="餵蛋糕"
                      onClick={() => feed()}
                    />
                    <FeedBtn
                      icon="bx-sushi"
                      text="餵壽司"
                      onClick={() => feed()}
                    />
                    <FeedBtn
                      icon="bx-coffee-togo"
                      text="餵咖啡"
                      onClick={() => feed()}
                    />
                  </>
                ) : (
                  <FeedBtn
                    icon="bx-knife"
                    text="送上西天"
                    onClick={() => die()}
                  />
                )}
              </motion.div>
            )}
            {!rock.live_status && (
              <div className="text-center text-red-400 font-bold">
                「{rock.name}」正在極樂世界
              </div>
            )}
            {detailInfo &&
              detailInfo.live_status &&
              detailInfo.alive_percent < 0.5 && (
                <div className="text-center text-red-400 font-bold">
                  「{rock.name}」餓死了，透過「送上西天」送他最後一程吧！
                </div>
              )}
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
                  <InfoField
                    label="活力"
                    value={`${detailInfo.alive_percent}%`}
                  />
                  <InfoField label="石頭編號" value={rock.id}>
                    <a
                      href={`https://goerli.etherscan.io/nft/${contractAddress}/${rock.id}`}
                      target="_blank"
                      className="underline text-blue-400"
                    >
                      #{rock.id}
                    </a>
                  </InfoField>
                  <InfoField
                    label="領養時間"
                    value={detailInfo.adopt_time.toLocaleString()}
                  />
                  <InfoField
                    label="存活狀態"
                    value={
                      detailInfo.live_status && detailInfo.alive_percent >= 0.5
                        ? `活著`
                        : `掰了`
                    }
                  />
                  <InfoField
                    label="鎖定狀態"
                    value={detailInfo.lock_status ? `是` : `否`}
                  />
                  <InfoField label="轉移石頭">
                    {detailInfo.lock_status ? (
                      <button
                        className="underline text-blue-400 cursor-pointer"
                        onClick={() => unlock()}
                      >
                        解鎖
                      </button>
                    ) : (
                      <button
                        className="underline text-blue-400 cursor-pointer"
                        onClick={() => transfer()}
                      >
                        轉移
                      </button>
                    )}
                  </InfoField>
                </motion.div>
              ) : (
                <motion.div className="flex justify-center items-center h-[144px]">
                  <i className="bx bx-loader-alt animate-spin text-4xl"></i>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </>
  ) : (
    <motion.div
      key={rock.id}
      className="flex flex-col gap-2 justify-center items-center bg-[#194d63] bg-opacity-50 hover:bg-opacity-80 backdrop-blur-md rounded-[16px] m-2 p-2 cursor-pointer relative"
      layout
      layoutId={`rock-${rock.id}`}
      onClick={() => setDetail(!detail)}
      style={{ zIndex }}
    >
      <motion.img
        src={rock.image}
        className={`w-full rounded-[8px] shadow aspect-square ${
          rock.live_status ? `` : `contrast-50 grayscale`
        }`}
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
              `https://pet-rock-eth.pancake.tw/nft/${id}.json`
            );
            rockInfo = await res.json();
            localStorage.setItem(`rock-${id}`, JSON.stringify(rockInfo));
          }
          let { live_status } = await getRockDetail(id);
          rockInfo.live_status = live_status;
          return rockInfo;
        })
      ).then((data) => setRocks(data));
      setLoading(false);
    }
    getRocks();
  }, [isConnected]);
  return (
    <>
      <h1 className="text-4xl text-center mt-2 font-bold">我ㄉ石頭</h1>
      <CheckConnected>
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-center items-center h-[512px]"
            >
              <i className="bx bx-loader-alt animate-spin text-4xl"></i>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!loading && rocks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 text-center"
            >
              你還沒有石頭喔
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!loading && rocks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="container"
            >
              <div className="mt-4 grid gap-2 grid-cols-[repeat(auto-fill,minmax(192px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(256px,1fr))]">
                {rocks.map((rock: any) => (
                  <Rock rock={rock} key={rock.id} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CheckConnected>
    </>
  );
}
