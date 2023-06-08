"use client";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
export default async function Rock() {
  const params = useParams();
  const { id } = params;
  async function getRock() {
    if (localStorage.getItem(`rock-${id}`)) {
      return JSON.parse(localStorage.getItem(`rock-${id}`) || "{}");
    }
    const res = await fetch(
      `https://ipfs.io/ipfs/bafybeibkrtttj2mtjmuwu26l7dlbmvt5k5qgah7qxmhobv3ps5j232tzdy/stone${id}.json`
    );
    return await res.json();
  }
  const rock = await getRock();
  return (
    <div className="container">
      <motion.div
        key={rock.id}
        className="flex flex-col lg:flex-row gap-4 bg-white bg-opacity-10 rounded-[16px] m-2 p-2"
        layout
        layoutId={`rock-${rock.id}`}
      >
        <motion.img
          src={rock.image}
          className="w-32 h-32 lg:w-64 lg:h-64 rounded-[8px]"
          layout
          layoutId={`rock-img-${rock.id}`}
        />
        <div>
          <motion.div
            className="text-white text-2xl font-bold mt-2"
            layout
            layoutId={`rock-name-${rock.id}`}
          >
            {rock.name}
          </motion.div>
          <motion.div className="text-white mt-2">
            {rock.description}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
