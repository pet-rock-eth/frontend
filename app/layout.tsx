"use client";
import "./globals.css";
import Nav from "./nav";
// wallet
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/react";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { goerli } from "wagmi/chains";

import { useIsMounted } from "../hooks/useIsMounted";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMounted = useIsMounted();
  if (!isMounted)
    return (
      <html lang="zh-TW">
        <head>
          <link
            href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
            rel="stylesheet"
          />
          <title>寵物石頭</title>
        </head>
        <body className="bg-[#002434] text-white">
          <div className="flex justify-center items-center h-screen">
            <i className="bx bx-loader-alt animate-spin text-4xl"></i>
          </div>
        </body>
      </html>
    );

  const chains = [goerli];
  const projectId = "d66d8414b9cd73ac0a0fdf9359c0a90c";

  const { publicClient } = configureChains(chains, [
    w3mProvider({ projectId }),
  ]);
  const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: w3mConnectors({ projectId, version: 1, chains }),
    publicClient,
  });
  const ethereumClient = new EthereumClient(wagmiConfig, chains);
  return (
    <html lang="zh-TW">
      <head>
        <link
          href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
          rel="stylesheet"
        />
        <title>寵物石頭</title>
      </head>
      <body className="bg-[#002434] text-white">
        <WagmiConfig config={wagmiConfig}>
          <Nav />
          {children}
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </body>
    </html>
  );
}
