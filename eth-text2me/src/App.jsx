import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json'

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState([]);
  const contractAddress = "0x64C189e96Eb2Dbb770991d4fF41f44582FfA0aC9";
  const contractABI = abi.abi;
  
  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        const wavesCleaned = waves.map(wave => {
          return {
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });
        setAllWaves(wavesCleaned);
      } else {
        console.error("Objeto Ethereum inexistente!");
      }
    } catch (error) {
      console.error(error);
    }
  };

// Escuta por eventos emitidos!
  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.error("Garanta que possua a Metamask instalada!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account)
        getAllWaves();

      } else {
        console.error("Nenhuma conta autorizada foi encontrada")
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
  * Implemente aqui o seu método connectWallet
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum && message) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
 
        let count = await wavePortalContract.getTotalWaves();
        console.log("Recuperado o número de messages...", count.toNumber());

        /*
        * Executar o aceno a partir do contrato inteligente
        */
        const waveTxn = await wavePortalContract.wave(message);
        console.log("Minerando...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Minerado -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Total de messages recuperado...", count.toNumber());
        
      } else {
        console.error("Objeto Ethereum não encontrado!");
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  useEffect(() => {
    setAccountListener();
  }, [window.ethereum])

  const setAccountListener = () => {
    window.ethereum.on("accountsChanged", (accounts) => {
      !accounts.length ? setCurrentAccount("") : setCurrentAccount(accounts[0]);
    });
  }

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          Web3 Public Repository
        </div>
        
        {!currentAccount && (
          <>
            <div className="alert">
              <p>Deployed on Goerli Testnet Network </p>
              <p>Address: 0x64C189e96Eb2Dbb770991d4fF41f44582FfA0aC9 </p>
            </div>
            <button id="connectWalletButton" className="waveButton" onClick={connectWallet}>
              Connect
            </button>
          </>
        )}

        {currentAccount && (
          <>
            <div className="title">
              Share with us the best video/article you've ever seen about web3.
            </div>

            <textarea
              type="text"
              className="waveTextArea"
              placeholder=" Let me see your content"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <button className="waveButton" onClick={() => {wave(); setMessage("")}}>
              I want to send
            </button>

            <div className="title">
              Our current content:
            </div>

            {allWaves.map((wave, index) => {
              return (
                <div key={index} className="list">
                  <div>Address: <p>{wave.address}</p></div>
                  <div>Date: <p>{wave.timestamp.toString()}</p></div>
                  <div>Message: <p>{wave.message}</p></div>
                </div>)
            })}
          </>
        )}
      </div>
      
    </div>
  );
}
