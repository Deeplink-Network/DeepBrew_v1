import { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';

// styles
import './index.scss';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import ImgArchitecture from 'assets/architecture.png';
import ImgDRLModel from 'assets/deep-reinforcement-learning-model1.png';
import ImgDRLModelFormula from 'assets/deep-reinforcement-learning-model.png';
import ImgRewardCalcFormula from 'assets/reward-calc-formula.png';

import TokenABI from 'constants/ABI/Token.json';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const filterGM = ['Orders', 'Backorders', 'Inventories', 'Balances'];
const filterDRLMetrics = ['Loss', 'Reward'];

const beerToken = {
  address: '0x6d59DE07EaCeD3Ef50Ee99Ef4781fD0611B5e637',
  label: 'BeerToken',
};
const cashToken = {
  address: '0xCcC359e46479a91aCC71895Cf24c8C3291631B0d',
  label: 'CashToken',
};

const agents = [
  {
    address: '0xD89a9D4098420eF2c6b3aeeb266a44f62084a15D',
    label: 'manufacturer',
    name: 'Keeper & Wallet',
    img: 'https://static.wixstatic.com/media/7b17b3_cc3dfc31181641b2a2735be6f5d87013~mv2.png/v1/fill/w_75,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/manufacturer.png',
  },
  {
    address: '0x43BF386C6fCbF57Bf355a1AE956c694AF33Ec4A9',
    label: 'distributor',
    name: 'Deep learning agent',
    img: 'https://static.wixstatic.com/media/7b17b3_01d1785a7d534e0eaa80ff0ab60414eb~mv2.png/v1/fill/w_75,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/distributor.png',
  },
  {
    address: '0x87Dda551c41007C17B61a0DEC62b5f0b29671682',
    label: 'wholesaler',
    name: 'Smart contract',
    img: 'https://static.wixstatic.com/media/7b17b3_a6ed53aa790f482b89ed43c1354f08f8~mv2.png/v1/fill/w_75,h_75,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/wholesaler.png',
  },
  {
    address: '0x79AF01Dc5B6bC91A49b60d42Adfd379Fef4C0e95',
    label: 'retailer',
    name: 'Smart contract',
    img: 'https://static.wixstatic.com/media/7b17b3_bb8be5f326c547ad9dde40c67886cbc4~mv2.png/v1/fill/w_70,h_70,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/retailer.png',
  },
  {
    address: '0xC07BA252866703433C0258DE7f35fdcDf8D5F92D',
    label: 'lastAgent',
  },
];

const BeerAniSVG = () => (
  <svg
    preserveAspectRatio="none"
    data-bbox="20 90.291 159.997 20.709"
    xmlns="http://www.w3.org/2000/svg"
    width="200"
    height="200"
    viewBox="20 90.291 159.997 20.709"
    data-type="shape"
    role="presentation"
    aria-hidden="true"
  >
    <g>
      <path
        fill="#253EEA"
        clip-rule="evenodd"
        d="M165.881 90.685l13.898 18.563a1.096 1.096 0 01-.877 1.752H21s-1 0-1-1 1-1 1-1l155.298-.005a.39.39 0 00.312-.625L164.091 92c-.484-.831.241-1.484.241-1.484s.92-.605 1.549.169z"
      ></path>
    </g>
  </svg>
);

const CashAniSVG = () => (
  <svg
    preserveAspectRatio="none"
    data-bbox="20 90.291 159.997 20.709"
    xmlns="http://www.w3.org/2000/svg"
    width="200"
    height="200"
    viewBox="20 90.291 159.997 20.709"
    data-type="shape"
    role="presentation"
    aria-hidden="true"
    style={{ transform: 'rotate(180deg)' }}
  >
    <g>
      <path
        fill="#27A303"
        clip-rule="#27A303"
        d="M165.881 90.685l13.898 18.563a1.096 1.096 0 01-.877 1.752H21s-1 0-1-1 1-1 1-1l155.298-.005a.39.39 0 00.312-.625L164.091 92c-.484-.831.241-1.484.241-1.484s.92-.605 1.549.169z"
      ></path>
    </g>
  </svg>
);

const Overview = () => {
  const etherscanURL = 'https://goerli.etherscan.io/';
  const pageSize = 3;
  const [lossData, setLossData] = useState([]);
  const [rewardData, setRewardData] = useState([]);
  const [orderData, setOrderData] = useState();
  const [inventoryData, setInventoryData] = useState();
  const [backOrderData, setBackOrderData] = useState();
  const [balanceData, setBalanceData] = useState();
  const [gmType, setGMType] = useState(filterGM[0]);
  const [metricType, setMetricType] = useState(filterDRLMetrics[0]);
  const [graph, setGraph] = useState();
  const [ledger, setLedger] = useState([]);
  const [aniNumber, setAniNumber] = useState(null);
  const [aniText, setAniText] = useState(null);
  const [pageNo, setPageNo] = useState(0);
  const [beerAmt, setBeerAmt] = useState([0, 0, 0, 0]);
  const [cashAmt, setCashAmt] = useState([0, 0, 0, 0]);

  const provider = new ethers.providers.JsonRpcProvider(
    process.env.REACT_APP_NETWORK_RPC,
    parseInt(process.env.REACT_APP_CHAIN_ID),
  );
  const beerContract = new ethers.Contract(
    beerToken.address,
    TokenABI,
    provider,
  );

  const cashContract = new ethers.Contract(
    cashToken.address,
    TokenABI,
    provider,
  );

  useEffect(() => {
    updateLedger();
    updateGraph();
    const timeInterval = setInterval(() => updateGraph(), 5000);
    const ledgerInterval = setInterval(() => updateLedger(), 10000);

    beerContract.on('Transfer', async (fromAddress, toAddress, amount) => {
      console.log(fromAddress, toAddress, amount);

      amount = Number(ethers.utils.formatEther(String(amount))).toFixed(2);
      let startIdx = agents.findIndex(
        (it) =>
          String(it.address).toLowerCase() ===
          String(fromAddress).toLowerCase(),
      );
      let endIdx = agents.findIndex(
        (it) =>
          String(it.address).toLowerCase() === String(toAddress).toLowerCase(),
      );
      if (startIdx === -1 && endIdx === 0) {
        setAniNumber(0);
        setAniText(`${amount} BEER`);
      } else if (startIdx === 0 && endIdx === 1) {
        setAniNumber(1);
        setAniText(`${amount} BEER`);
      } else if (startIdx === 1 && endIdx === 2) {
        setAniNumber(2);
        setAniText(`${amount} BEER`);
      } else if (startIdx === 2 && endIdx === 3) {
        setAniNumber(3);
        setAniText(`${amount} BEER`);
      } else if (startIdx === 3) {
        setAniNumber(4);
        setAniText(`${amount} BEER`);
      }
    });

    cashContract.on('Transfer', async (fromAddress, toAddress, amount) => {
      console.log(fromAddress, toAddress, amount);

      amount = Number(ethers.utils.formatEther(String(amount))).toFixed(2);
      let startIdx = agents.findIndex(
        (it) =>
          String(it.address).toLowerCase() ===
          String(fromAddress).toLowerCase(),
      );
      let endIdx = agents.findIndex(
        (it) =>
          String(it.address).toLowerCase() === String(toAddress).toLowerCase(),
      );
      if (endIdx === 3) {
        setAniNumber(5);
        setAniText(`${amount} CASH`);
      } else if (startIdx === 3 && endIdx === 2) {
        setAniNumber(6);
        setAniText(`${amount} CASH`);
      } else if (startIdx === 2 && endIdx === 1) {
        setAniNumber(7);
        setAniText(`${amount} CASH`);
      } else if (startIdx === 1 && endIdx === 0) {
        setAniNumber(8);
        setAniText(`${amount} CASH`);
      } else if (startIdx === 0 && endIdx === -1) {
        setAniNumber(9);
        setAniText(`${amount} CASH`);
      }
    });

    return () => {
      clearInterval(timeInterval);
      clearInterval(ledgerInterval);
    };
  }, []);

  useEffect(() => {
    updateChart();
  }, [gmType, orderData, inventoryData, backOrderData, balanceData]);

  useEffect(async () => {
    if (aniNumber >= 0) {
      setTimeout(() => {
        setAniNumber(null);
        setAniText(null);
      }, 5000);
    }

    let beers = [];
    let cashes = [];
    for (let i = 0; i < agents.length - 1; i++) {
      beers.push(
        ethers.utils.formatEther(
          ethers.BigNumber.from(
            await beerContract.balanceOf(agents[i].address),
          ).toString(),
        ),
      );
      cashes.push(
        ethers.utils.formatEther(
          ethers.BigNumber.from(
            await cashContract.balanceOf(agents[i].address),
          ).toString(),
        ),
      );
    }
    setBeerAmt([...beers]);
    setCashAmt([...cashes]);
  }, [aniNumber]);

  const formatAddress = (address) => {
    const aIndex = agents.findIndex(
      (it) =>
        String(it.address).toLowerCase() === String(address).toLowerCase(),
    );

    if (aIndex == -1) return '';

    return `(${agents[aIndex].label})`;
  };

  const updateLedger = async () => {
    const beerTx = (
      await axios.get(
        `https://api.covalenthq.com/v1/5/address/${beerToken.address}/transactions_v2/?key=ckey_f1e8d99442404057940e24b473f`,
      )
    ).data.data.items;
    const cashTx = (
      await axios.get(
        `https://api.covalenthq.com/v1/5/address/${cashToken.address}/transactions_v2/?key=ckey_f1e8d99442404057940e24b473f`,
      )
    ).data.data.items;

    const res = [...beerTx, ...cashTx].sort((a, b) =>
      a.block_height < b.block_height ? 1 : -1,
    );

    setLedger([...res]);
  };

  const updateGraph = async () => {
    const reward = (
      await axios.get('https://deepbrew.au.ngrok.io/model/reward')
    ).data;
    const loss = (await axios.get('https://deepbrew.au.ngrok.io/model/loss'))
      .data;
    const orders = (await axios.get('https://deepbrew.au.ngrok.io/game/orders'))
      .data;
    const inventory = (
      await axios.get('https://deepbrew.au.ngrok.io/game/inventories')
    ).data;
    const backOrder = (
      await axios.get('https://deepbrew.au.ngrok.io/game/backorders')
    ).data;
    const balance = (
      await axios.get('https://deepbrew.au.ngrok.io/game/balances')
    ).data;
    setLossData(loss);
    setRewardData(reward);
    setOrderData(orders);
    setInventoryData(inventory);
    setBackOrderData(backOrder);
    setBalanceData(balance);
  };

  const updateChart = () => {
    if (gmType === filterGM[0] && orderData) {
      setGraph({
        labels: orderData.Round,
        datasets: [
          {
            id: 1,
            label: 'Manufacturer Orders',
            data: orderData['Manufacturer Orders'],
            backgroundColor: 'rgb(100, 100, 255)',
            borderColor: 'rgb(150, 150, 255)',
          },
          {
            id: 2,
            label: 'Distributor Orders',
            data: orderData['Distributor Orders'],
            backgroundColor: 'rgb(100, 255, 255)',
            borderColor: 'rgb(150, 255, 255)',
          },
          {
            id: 3,
            label: 'Wholesaler Orders',
            data: orderData['Wholesaler Orders'],
            backgroundColor: 'rgb(255, 255, 100)',
            borderColor: 'rgb(255, 255, 150)',
          },
          {
            id: 4,
            label: 'Retailer Orders',
            data: orderData['Retailer Orders'],
            backgroundColor: 'rgb(0, 255, 100)',
            borderColor: 'rgb(0, 255, 150)',
          },
          {
            id: 5,
            label: 'Market Demand',
            data: orderData['Market Demand'],
            backgroundColor: 'rgb(0, 0, 0)',
            borderColor: 'rgb(0, 0, 0)',
          },
        ],
      });
    } else if (gmType === filterGM[1] && backOrderData) {
      setGraph({
        labels: backOrderData.Round,
        datasets: [
          {
            id: 1,
            label: 'Manufacturer Backorder',
            data: backOrderData['Manufacturer Backorder'],
            backgroundColor: 'rgb(100, 100, 255)',
            borderColor: 'rgb(150, 150, 255)',
          },
          {
            id: 2,
            label: 'Distributor Backorder',
            data: backOrderData['Distributor Backorder'],
            backgroundColor: 'rgb(100, 255, 255)',
            borderColor: 'rgb(150, 255, 255)',
          },
          {
            id: 3,
            label: 'Wholesaler Backorder',
            data: backOrderData['Wholesaler Backorder'],
            backgroundColor: 'rgb(255, 255, 100)',
            borderColor: 'rgb(255, 255, 150)',
          },
          {
            id: 4,
            label: 'Retailer Backorder',
            data: backOrderData['Retailer Backorder'],
            backgroundColor: 'rgb(0, 255, 100)',
            borderColor: 'rgb(0, 255, 150)',
          },
        ],
      });
    } else if (gmType === filterGM[2] && inventoryData) {
      setGraph({
        labels: inventoryData.Round,
        datasets: [
          {
            id: 1,
            label: 'Manufacturer Inventory',
            data: inventoryData['Manufacturer Inventory'],
            backgroundColor: 'rgb(100, 100, 255)',
            borderColor: 'rgb(150, 150, 255)',
          },
          {
            id: 2,
            label: 'Distributor Inventory',
            data: inventoryData['Distributor Inventory'],
            backgroundColor: 'rgb(100, 255, 255)',
            borderColor: 'rgb(150, 255, 255)',
          },
          {
            id: 3,
            label: 'Wholesaler Inventory',
            data: inventoryData['Wholesaler Inventory'],
            backgroundColor: 'rgb(255, 255, 100)',
            borderColor: 'rgb(255, 255, 150)',
          },
          {
            id: 4,
            label: 'Retailer Inventory',
            data: inventoryData['Retailer Inventory'],
            backgroundColor: 'rgb(0, 255, 100)',
            borderColor: 'rgb(0, 255, 150)',
          },
        ],
      });
    } else if (gmType === filterGM[3] && balanceData) {
      setGraph({
        labels: balanceData.Round,
        datasets: [
          {
            id: 1,
            label: 'Manufacturer Balance',
            data: balanceData['Manufacturer Balance'],
            backgroundColor: 'rgb(100, 100, 255)',
            borderColor: 'rgb(150, 150, 255)',
          },
          {
            id: 2,
            label: 'Distributor Balance',
            data: balanceData['Distributor Balance'],
            backgroundColor: 'rgb(100, 255, 255)',
            borderColor: 'rgb(150, 255, 255)',
          },
          {
            id: 3,
            label: 'Wholesaler Balance',
            data: balanceData['Wholesaler Balance'],
            backgroundColor: 'rgb(255, 255, 100)',
            borderColor: 'rgb(255, 255, 150)',
          },
          {
            id: 4,
            label: 'Retailer Balance',
            data: balanceData['Retailer Balance'],
            backgroundColor: 'rgb(0, 255, 100)',
            borderColor: 'rgb(0, 255, 150)',
          },
        ],
      });
    }
  };

  const formatLedgerTime = (time) => {
    let diff = Math.floor((new Date().getTime() - time) / 1000.0);

    if (diff < 60) {
      return `${diff} ${diff === 1 ? 'sec' : 'secs'} ago`;
    }

    if (diff < 3600) {
      diff = Math.ceil(diff / 60);
      return `${diff} ${diff === 1 ? 'min' : 'mins'} ago`;
    }

    if (diff < 3600 * 24) {
      let hours = Math.floor(diff / 3600);
      let mins = Math.floor((diff / 60) % 60);

      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} ${mins} ${
        mins === 1 ? 'min' : 'mins'
      } ago`;
    }

    if (diff >= 3600 * 24) {
      let days = Math.floor(diff / 3600 / 24);
      let hours = Math.floor((diff / 3600) % 24);

      return `${days} ${days === 1 ? 'day' : 'days'} ${hours} ${
        hours === 1 ? 'hr' : 'hrs'
      }  ago`;
    }
  };

  return (
    <div className="main-content overview">
      <h1>DeepBrew: Deep Q-learning for an On-chain Beer Game</h1>
      <h2>
        Connecting off-chain deep learning to on-chain Ethereum execution.
      </h2>
      <ul className="overview__links">
        <li>
          <img
            src="https://static.wixstatic.com/media/7b17b3_a32a79cd459649fdb7aa1ca1e7312565~mv2.jpg/v1/fill/w_26,h_26,al_c,q_80,usm_0.66_1.00_0.01,enc_auto/Web_(35).jpg"
            alt=""
          />
          <span>Methodology</span>
        </li>
        <li
          onClick={() =>
            window.open('https://github.com/Deeplink-Network/DeepBrew')
          }
        >
          <img
            src="https://static.wixstatic.com/media/7b17b3_23f793aa297643d49ff15d6be7ec7add~mv2.png/v1/crop/x_698,y_0,w_2374,h_1463/fill/w_34,h_21,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/GitHub-logo.png"
            alt=""
          />
          <span>Code</span>
        </li>
        <li>
          <img
            src="https://static.wixstatic.com/media/7b17b3_0501de01ec20437e84d33989be4459b9~mv2.png/v1/crop/x_0,y_0,w_640,h_364/fill/w_36,h_21,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/AWS-S3-min_edited.png"
            alt=""
          />
          <span>Off-chain environment</span>
        </li>
      </ul>
      <p style={{ marginBottom: 0, marginTop: '5rem' }}>
        DeepBrew is a research project aimed at progressing the synthesis of
        machine learning and blockchain technologies. In particular DeepBrew
        involves the augmentation of Ethereum smart contracts with deep
        reinforcement learning agency to enable intelligence and dynamism beyond
        the scope of traditional contracts while still maintaining the
        decentralization and security aspects of the EVM. <br />
        <br />
        Games provide the perfect environment for developing new reinforcement
        learning techniques. The Beer Game, a famous macroeconomics problem
        devised at MIT was chosen as an appropriate environment for the
        demonstration of off-to-on-chain machine learning, as it is simple to
        understand yet difficult to master, and can be perfectly represented as
        a system of transactions. This page shows an AI being trained to play
        the game in real-time on the Goerli Ethereum testnet.
      </p>
      <h3>Live Performance</h3>
      <p style={{ marginBottom: '3rem' }}>
        Watch the game unfold on the Goerli Ethereum testnet in real-time, as
        agents swap BEER for CASH tokens in accordance with instructions from
        the deep reinforcement learning environment and model keeper script.
      </p>
      <div className="overview__game-model">
        {/* <img src={ImgGameModel} alt="" /> */}
        <div className="overview__game-model__wrapper">
          <div className="overview__game-model__ani">
            {aniNumber && aniText ? (
              <span
                className={
                  aniNumber === 0 ? 'overview__game-model__animation' : ''
                }
              >
                {aniNumber === 0 ? `+${aniText}` : ''}
              </span>
            ) : (
              <span />
            )}
            {BeerAniSVG()}
            {CashAniSVG()}
            {aniNumber && aniText ? (
              <span
                className={
                  aniNumber === 9 ? 'overview__game-model__animation' : ''
                }
              >
                {aniNumber === 9 ? `-${aniText}` : ''}
              </span>
            ) : (
              <span />
            )}
          </div>
          {agents.map((it, idx) => {
            return (
              idx != agents.length - 1 && (
                <>
                  <div className="overview__game-model__item">
                    <div className="overview__game-model__item-image">
                      <p className="text-left">{it.label}</p>
                      <img src={it.img} alt="" />
                      <p className="text-center">{it.name}</p>
                    </div>

                    <div className="overview__game-model__item-amount">
                      <p className="beer">{`Beer Token: ${Number(
                        beerAmt[idx],
                      ).toLocaleString()}`}</p>
                      <p className="cash">{`Cash Token: ${Number(
                        cashAmt[idx],
                      ).toLocaleString()}`}</p>
                    </div>
                  </div>

                  <div className="overview__game-model__ani">
                    {aniNumber && aniText ? (
                      <span
                        className={
                          aniNumber === idx + 1
                            ? 'overview__game-model__animation'
                            : ''
                        }
                      >
                        {aniNumber === idx + 1 ? `+${aniText}` : ''}
                      </span>
                    ) : (
                      <span />
                    )}
                    {BeerAniSVG()}
                    {CashAniSVG()}
                    {aniNumber && aniText ? (
                      <span
                        className={
                          aniNumber === 9 - idx - 1
                            ? 'overview__game-model__animation'
                            : ''
                        }
                      >
                        {aniNumber === 9 - idx - 1 ? `-${aniText}` : ''}
                      </span>
                    ) : (
                      <span />
                    )}
                  </div>
                </>
              )
            );
          })}
        </div>
      </div>
      <h3>Game Metrics</h3>
      <ul className="overview__live-tx" style={{ marginBottom: 16 }}>
        <li>
          Orders: The number of BEER tokens ordered by each agent in that round
        </li>
        <li>
          Backorders: When agents are unable to meet their client's demand,
          those unfilled orders are appended to their backorder
        </li>
        <li>Inventories: The number of BEER tokens held by each agent</li>
        <li>Balances: The CASH balance of each agent</li>
      </ul>
      <div className="overview__filter">
        {filterGM.map((it) => {
          return (
            <div
              className={`overview__filter-item ${
                it === gmType ? 'active' : ''
              }`}
              onClick={() => setGMType(it)}
            >
              <span>{it}</span>
            </div>
          );
        })}
      </div>
      <div className="overview__line">
        <div className="left-label">{`${gmType} (${
          gmType === 'Balances' ? 'CASH' : 'BEER'
        })`}</div>
        <div className="bottom-label">Rounds</div>
        <Line
          datasetIdKey="id"
          data={{
            labels: graph ? graph.labels : [],
            datasets: graph ? graph.datasets : [],
          }}
          options={{
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
          }}
        />
      </div>
      <h3>Deep Reinforcement Learning Metrics</h3>
      <ul className="overview__live-tx">
        <li>
          Loss: A measure of the performance of the agent's outputs using the
          Huber loss method (lower loss values are good)
        </li>
        <li>
          Reward: The cumulative reward of the agent after each game given by
          the following formula (higher reward values are good) <br />
          <img
            src={ImgRewardCalcFormula}
            alt=""
            style={{
              height: '3.5rem',
              width: 'auto',
              marginTop: 8,
              transform: 'translateX(90%)',
            }}
          />
        </li>
      </ul>
      <div className="overview__filter">
        {filterDRLMetrics.map((it) => {
          return (
            <div
              className={`overview__filter-item ${
                it === metricType ? 'active' : ''
              }`}
              onClick={() => setMetricType(it)}
            >
              <span>{it}</span>
            </div>
          );
        })}
      </div>
      <div className="overview__line">
        <div className="left-label" style={{ left: 0 }}>
          {metricType}
        </div>
        <div className="bottom-label">Iteration</div>
        <Line
          datasetIdKey="id"
          data={{
            labels: lossData.Episode,
            datasets: [
              metricType === filterDRLMetrics[0]
                ? {
                    id: 1,
                    label: 'Loss',
                    data: lossData.Loss,
                    backgroundColor: 'rgba(100, 100, 255)',
                    borderColor: 'rgba(150, 150, 255)',
                  }
                : {
                    id: 2,
                    label: 'Reward',
                    data: rewardData.Reward,
                    backgroundColor: 'rgba(255, 100, 100)',
                    borderColor: 'rgba(255, 150, 100)',
                  },
            ],
          }}
          options={{
            plugins: {
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
          }}
        />
      </div>
      <h3>Live transactions</h3>
      <p>
        Observe the game's transactions pulled directly from the Goerli ledger
      </p>
      <div className="ledger__wrapper">
        {ledger &&
          ledger
            .slice(pageNo * pageSize, pageNo * pageSize + pageSize)
            .map((it) => {
              return (
                <div className="ledger__item">
                  <div
                    className="d-flex justify-content-between align-items-center"
                    style={{ marginBottom: 16 }}
                  >
                    <div className="d-flex flex-column">
                      <p>TX HASH</p>
                      <a
                        href={`${etherscanURL}/tx/${it.tx_hash}`}
                        target="_blank"
                      >
                        {it.tx_hash}
                      </a>
                    </div>
                    <div className="d-flex flex-column">
                      <span>
                        {formatLedgerTime(
                          new Date(it.block_signed_at).getTime(),
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between">
                    <div className="d-flex flex-column">
                      <p>FROM ADDRESS</p>
                      <a
                        href={`${etherscanURL}/address/${it.from_address}`}
                        target="_blank"
                      >
                        {it.from_address} <br />
                        <span>{formatAddress(it.from_address)}</span>
                      </a>
                    </div>

                    <div className="d-flex flex-column">
                      <p>TO CONTRACT ADDRESS</p>

                      <a
                        href={`${etherscanURL}/address/${it.to_address}`}
                        target="_blank"
                      >
                        {it.to_address} <br />
                        <span>{formatAddress(it.to_address)}</span>
                      </a>
                    </div>

                    <div className="d-flex flex-column">
                      <p>GAS USED</p>
                      <span>{it.gas_spent}</span>
                    </div>

                    {it &&
                    it.log_events &&
                    it.log_events.length === 1 &&
                    it.log_events[0].sender_contract_ticker_symbol &&
                    it.log_events[0].raw_log_topics &&
                    it.log_events[0].raw_log_topics.length === 3 ? (
                      <button
                        className={
                          it.log_events[0].sender_contract_ticker_symbol ===
                          'BEER'
                            ? 'beer'
                            : 'cash'
                        }
                      >
                        {it.log_events[0].sender_contract_ticker_symbol ===
                        'BEER'
                          ? '+'
                          : '-'}
                        {Number(
                          ethers.utils.formatEther(
                            ethers.BigNumber.from(
                              it.log_events[0].raw_log_data,
                            ).toString(),
                          ),
                        ).toFixed(2)}
                        {it.log_events[0].sender_contract_ticker_symbol ===
                        'BEER'
                          ? ' BEER'
                          : ' CASH'}
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              );
            })}
      </div>
      <div className="overview__pagination">
        <div onClick={() => setPageNo(0)}>First</div>
        <div onClick={() => setPageNo(pageNo > 0 ? pageNo - 1 : pageNo)}>
          {'<'}
        </div>
        <div>{`Page ${pageNo + 1} of ${Math.ceil(
          ledger.length / pageSize,
        )}`}</div>
        <div
          onClick={() =>
            setPageNo(
              pageNo < ledger.length / pageSize - 1 ? pageNo + 1 : pageNo,
            )
          }
        >
          {'>'}
        </div>
        <div onClick={() => setPageNo(Math.ceil(ledger.length / pageSize - 1))}>
          Last
        </div>
      </div>
      <h3>The methodology</h3>
      <p>
        In addition to this live demonstration, DeepBrew also serves as a
        foundational methodology for the development of on-chain machine
        learning agents.
      </p>
      <ul className="overview__live-tx">
        <li>
          The Beer Game was first recreated on a local Ganache Ethereum testnet,
          in which agents were represented by wallets and were given rule-based
          algorithms known as the 'base-stock policy'
        </li>
        <li>
          The game was then converted to OpenAI's Gym framework for
          reinforcement learning
        </li>
        <li>
          A soft actor-critic deep Q-learning model was then trained to play the
          game as the Distributor agent
        </li>
        <li>
          The game was then migrated onto the Goerli testnet, and the wallets
          representing agents were replaced with smart contracts, demonstrating
          the system's ability to control smart contract execution via deep
          learning outputs on a public blockchain via Web3 contract calls
        </li>
      </ul>
      <p>
        <br />
        The following architecture outlines the framework for connecting
        off-chain machine learning to on-chain smart contract execution
      </p>
      <img className="img__architecture" src={ImgArchitecture} alt="" />
      <h3>Deep Reinforcement Learning Model (Soft Actor-critic)</h3>
      <p>
        The selected model for optimizing The Beer Game is a relatively
        lightweight soft actor critic deep Q-learning model, a type of
        reinforcement learning model which builds on the traditional Q-learning
        actor-critic framework of policy adjustment via Q-functions by making
        two estimates for Q-values in an effeort to avoid overvaluing rewards.
        The model is separated into an actor and critic, the actor makes actions
        in the space, and the critic evaluates the effectiveness of those
        actions. This is done via clipped double Q-learning which takes the
        minimum of two Q-value estimates using the following function:
      </p>
      <img className="img__drl-model1" src={ImgDRLModelFormula} alt="" />
      <img className="img__drl-model" src={ImgDRLModel} alt="" />
      <h3>Applications and future work</h3>
      <p>
        The applications of this technique are broad in scope, and can be
        applied to any problem in which dynamism and intelligence would benefit
        a Web3-based use-case. Some examples of these applications include but
        are not limited to:
      </p>{' '}
      <ul className="overview__live-tx">
        <li>DeFi Capital Efficiency</li>
        <li>On-chain Algorithms</li>
        <li>On-chain Credit Scores</li>
        <li>Artificially Intelligent Smart Order Routing</li>
        <li>DEX Aggregation</li>
      </ul>
      <h3>On-chain Machine Learning Workflow</h3>
      <p>
        This project was undertaken largely in order to develop a methodology
        for the implementation of more practical off-to-on-chain reinforcement
        learning systems. This workflow can be broken down into following steps:
      </p>{' '}
      <p className="mb-0">
        1. Recreate your Web3 problem as accurately as possible in a local
        testnet such as Ganache
      </p>
      <ul className="overview__workflow">
        <li>
          Local testnets are recommended for this stage as they run dramatically
          faster than public testnets, and have admin functionality
        </li>
        <li>
          This may be less daunting of a task than it sounds, as the code on
          which Web3 ecosystem reside is publicly available
        </li>
      </ul>
      <p className="mb-0 mt-4">
        {' '}
        2. Convert this problem into a reinforcement learning environment
      </p>
      <ul className="overview__workflow">
        <li>OpenAI's Gym class is a good starting point </li>
      </ul>
      <p className="mb-0 mt-4">
        3. Train a reinforcement learning model to optimize your problem
      </p>
      <p className="mb-0 mt-4">
        4. Deploy your system onto a public testnet such as Goerli for
        bugtesting purposes
      </p>
      <ul className="overview__workflow">
        <li>
          Sending transactions on a public blockchain is more involved than on a
          local one
        </li>
        <li>
          This will also give you a sense for the real-world execution speeds
          you can expect
        </li>
      </ul>
      <p className="mb-0 mt-4">
        5. Once this model performs satisfactorily, leverage transfer learning
        techniques to deploy your model onto the mainnet
      </p>
      <ul className="overview__workflow">
        <li>
          Transfer learning allows the model to begin training from where the
          prototypes left off, rather than deploying a randomly acting agent
          onto the mainnet with real funds
        </li>
        <li>
          It is strongly advised that safety measures such as spending limits
          are put in place to keep the model from doing anything extreme
        </li>
      </ul>
    </div>
  );
};

export default Overview;
