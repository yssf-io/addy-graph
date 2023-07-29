"use client";
import { LiteTransaction, getETHInOutTransactions } from "@/(data)/addresses";
import { useEffect, useState } from "react";
import TransactionsGraph, { GraphData } from "./(components)/TransactionsGraph";

export default function Home() {
  const [data, setData] = useState<GraphData | null>(null);

  function transformToGraphData(
    inTx: LiteTransaction[],
    outTx: LiteTransaction[]
  ): GraphData {
    const txs = [...inTx, ...outTx];
    const nodes = [...new Set(txs.flatMap((tx) => [tx.from, tx.to]))].map(
      (id) => ({
        id,
        value: "default_value",
        x: Math.random() * 800,
        y: Math.random() * 600,
      })
    );
    const links = txs.map((tx) => ({
      source: tx.from,
      target: tx.to,
      value: tx.value.toString(),
    }));

    return { nodes, links };
  }

  useEffect(() => {
    const fetchData = async () => {
      const { inTx, outTx } = await getETHInOutTransactions("");
      const graphData = transformToGraphData(inTx, outTx);
      setData(graphData);
    };

    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <h1 className="text-6xl font-light text-center">Addy Graph</h1>
      {data && <TransactionsGraph data={data} />}
    </main>
  );
}
