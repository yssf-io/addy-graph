import axios from "axios";

const ETHERSCAN_API_KEY = "";

export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: bigint;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
  methodId: string;
  functionName: string;
}

export interface LiteTransaction {
  timestamp: string;
  from: string;
  to: string;
  value: bigint;
  tokenSymbol: string;
  chainId: number;
}

const convertToLiteTransaction = (
  transaction: Transaction
): LiteTransaction => {
  return {
    timestamp: transaction.timeStamp,
    from: transaction.from,
    to: transaction.to,
    value: BigInt(transaction.value),
    tokenSymbol: "ETH",
    chainId: 1,
  };
};

export async function getETHInOutTransactions(address: string) {
  const response = await axios.get(
    `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${ETHERSCAN_API_KEY}`
  );

  const transactions = response.data.result as Transaction[];

  const nonNullTransactions = transactions.filter(
    (transaction) => transaction.value > 0
  );

  const inTx = nonNullTransactions.filter(
    (transaction) => transaction.to.toLowerCase() === address.toLowerCase()
  );
  const outTx = nonNullTransactions.filter(
    (transaction) =>
      transaction.from.toLocaleLowerCase() === address.toLocaleLowerCase()
  );

  return {
    inTx: inTx.map((transaction) => convertToLiteTransaction(transaction)),
    outTx: outTx.map((transaction) => convertToLiteTransaction(transaction)),
  };
}
