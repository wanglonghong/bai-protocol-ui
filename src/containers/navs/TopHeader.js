import {
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap';
import {
  HeaderContainer,
  HeaderWrapper,
  TopbarWrapper,
  TopMenu,
  HeroSection,
} from './styles';

import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { compose } from 'recompose';
import { NavLink, withRouter,useLocation,Redirect } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { Select, Icon } from 'antd';
import BigNumber from 'bignumber.js';
import {
  getTokenContract,
  getVbepContract,
  getComptrollerContract,
  getVaiTokenContract,
  methods
} from 'utilities/ContractService';
import { promisify } from 'utilities';
import * as constants from 'utilities/constants';
import ConnectModal from 'components/Basic/ConnectModal';
import { Label } from 'components/Basic/Label';
import Button from '@material-ui/core/Button';
import { connectAccount, accountActionCreators } from 'core';
import MetaMaskClass from 'utilities/MetaMask';
import logoImg from 'assets/img/logo.png';
import commaNumber from 'comma-number';
import { checkIsValidNetwork, getBigNumber } from 'utilities/common';
import toast from 'components/Basic/Toast';

import menuItems, { topMenuItems } from './menu';

import logoImage from 'assets/img/logo.png';

const ConnectButton = styled.div`
  display: flex;
  justify-content: center;
  
  @media only screen and (max-width: 768px) {
    margin: 0;
  }

  .connect-btn {
    width: 114px;
    height: 30px;
    border-radius: 5px;
    background-image: linear-gradient(to right,rgb(28,183,247),rgb(18,153,207));

    @media only screen and (max-width: 768px) {
      width: 60px;
    }

    .MuiButton-label {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-main);
      text-transform: capitalize;

      @media only screen and (max-width: 768px) {
        font-size: 12px;
      }
    }
  }
`;

let metamask = null;
let accounts = [];
let metamaskWatcher = null;
const abortController = new AbortController();

const format = commaNumber.bindWith(',', '.');

const TopHeader = ({ history, settings, setSetting, getGovernanceVenus }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isMarketInfoUpdating, setMarketInfoUpdating] = useState(false);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [awaiting, setAwaiting] = useState(false);
  const [totalVaiMinted, setTotalVaiMinted] = useState('0');
  const [tvl, setTVL] = useState(new BigNumber(0));
  const [wcUri, setWcUri] = useState(null);

  const [selectedMenu, setSelectedMenu] = useState('');
  const [selectedPath, setSelectedPath] = useState('');
  const [hoverMenu, setHoverMenu] = useState('');
  const [mobileRedirect, setMobileRedirect] = useState(false);
  const [menuItem, setMenuItem] = useState(menuItems[0]);

  const path = useLocation().pathname;

  const checkNetwork = () => {
    let netId;
    if (settings.walletType === 'binance') {
      netId = +window.BinanceChain.chainId;
    } else {
      netId = window.ethereum.networkVersion
        ? +window.ethereum.networkVersion
        : +window.ethereum.chainId;
    }
    setSetting({
      wrongNetwork: true
    });
    if (netId) {
      if (netId === 97 || netId === 56) {
        if (netId === 97 && process.env.REACT_APP_ENV === 'prod') {
          toast.error({
            title: `You are currently visiting the Binance Testnet Smart Chain Network. Please change your metamask to access the Binance Smart Chain Main Network`
          });
        } else if (netId === 56 && process.env.REACT_APP_ENV === 'dev') {
          toast.error({
            title: `You are currently visiting the Binance Smart Chain Main Network. Please change your metamask to access the Binance Testnet Smart Chain Network`
          });
        } else {
          setSetting({
            wrongNetwork: false
          });
        }
      } else {
        toast.error({
          title: `Bidao is only supported on Binance Smart Chain Network. Please confirm you installed Metamask and selected Binance Smart Chain Network`
        });
      }
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.addEventListener('load', () => {
        checkNetwork();
      });
    }
  }, [window.ethereum]);

  // ---------------------------------MetaMask connect-------------------------------------
  const withTimeoutRejection = async (promise, timeout) => {
    const sleep = new Promise((resolve, reject) =>
      setTimeout(() => reject(new Error(constants.TIMEOUT)), timeout)
    );
    return Promise.race([promise, sleep]);
  };

  const handleWatch = useCallback(async () => {
    if (window.ethereum) {
      const accs = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accs[0]) {
        accounts = [];
        clearTimeout(metamaskWatcher);
        setSetting({ selectedAddress: null });
      }
    }
    if (metamaskWatcher) {
      clearTimeout(metamaskWatcher);
    }

    if (!web3 || !accounts.length) {
      setAwaiting(true);
    }

    try {
      const isLocked = error && error.message === constants.LOCKED;
      if (!metamask || isLocked) {
        metamask = await withTimeoutRejection(
          MetaMaskClass.initialize(undefined), // if option is existed, add it
          20 * 1000 // timeout
        );
      }

      let [tempWeb3, tempAccounts, latestBlockNumber] = await Promise.all([
        metamask.getWeb3(),
        metamask.getAccounts(),
        metamask.getLatestBlockNumber(),
      ]);
      accounts = tempAccounts;
      setWeb3(tempWeb3);
      setError(null);
      setAwaiting(false);
      setSetting({ 
        selectedAddress: tempAccounts[0],
        latestBlockNumber,
       });
      metamaskWatcher = setTimeout(() => {
        clearTimeout(metamaskWatcher);
        handleWatch();
      }, 3000);
    } catch (err) {
      setSetting({ selectedAddress: null });
      accounts = [];
      setWeb3(null);
      setError(err);
      setAwaiting(false);
    }
  }, [error, web3]);

  const handleMetaMask = () => {
    setSetting({ walletType: 'metamask' });
    setError(MetaMaskClass.hasWeb3() ? '' : new Error(constants.NOT_INSTALLED));
    handleWatch();
  };
  // -------------------------------------------------------------------------------------

  const setDecimals = async () => {
    const decimals = {};
    Object.values(constants.CONTRACT_TOKEN_ADDRESS).forEach(async item => {
      decimals[`${item.id}`] = {};
      if (item.id !== 'bnb') {
        const tokenContract = getTokenContract(item.id);
        const tokenDecimals = await methods.call(
          tokenContract.methods.decimals,
          []
        );
        const vBepContract = getVbepContract(item.id);
        const vtokenDecimals = await methods.call(
          vBepContract.methods.decimals,
          []
        );
        decimals[`${item.id}`].token = Number(tokenDecimals);
        decimals[`${item.id}`].vtoken = Number(vtokenDecimals);
        decimals[`${item.id}`].price = 18 + 18 - Number(tokenDecimals);
      } else {
        decimals[`${item.id}`].token = 18;
        decimals[`${item.id}`].vtoken = 8;
        decimals[`${item.id}`].price = 18;
      }
    });
    setSetting({ decimals });
  };

  const initSettings = async () => {
    await setDecimals();
    setSetting({
      pendingInfo: {
        type: '',
        status: false,
        amount: 0,
        symbol: ''
      }
    });
  };

  useEffect(() => {
    if (accounts.length !== 0) {
      setIsOpenModal(false);
    }
    return function cleanup() {
      abortController.abort();
    };
  }, [handleWatch, settings.accounts]);

  useEffect(() => {
    handleWatch();
  }, [window, history]);

  const getTotalVaiMinted = async () => {
    // total vai minted
    const vaiContract = getVaiTokenContract();
    let tvm = await methods.call(vaiContract.methods.totalSupply, []);
    tvm = new BigNumber(tvm).div(new BigNumber(10).pow(18));
    setTotalVaiMinted(tvm);
  };

  const getMarkets = async () => {
    const res = await promisify(getGovernanceVenus, {});
    if (!res.status) {
      return;
    }
    const markets = Object.values(constants.CONTRACT_VBEP_ADDRESS)
      .map(item => res.data.markets.find(market => market.address.toLowerCase() === item.address.toLowerCase()))
      .filter(item => !!item)
    ;

    setSetting({
      markets,
      dailyVenus: res.data.dailyVenus
    });
  };

  useEffect(() => {
    let updateTimer;
    if (settings.selectedAddress) {
      updateTimer = setInterval(() => {
        if (checkIsValidNetwork(settings.walletType)) {
          getMarkets();
        }
      }, 5000);
    }
    return function cleanup() {
      abortController.abort();
      if (updateTimer) {
        clearInterval(updateTimer);
      }
    };
  }, [settings.selectedAddress, settings.accountLoading]);

  const onChangePage = value => {
    history.push(`/${value}`);
  };

  useEffect(() => {
    if (checkIsValidNetwork(settings.walletType)) {
      getTotalVaiMinted();
    }
  }, [settings.markets]);

  useEffect(() => {
    if (window.ethereum) {
      if (
        !settings.accountLoading &&
        checkIsValidNetwork(settings.walletType)
      ) {
        initSettings();
      }
    }
    return function cleanup() {
      abortController.abort();
    };
  }, [settings.accountLoading]);

  useEffect(() => {
    if (!settings.selectedAddress) {
      return;
    }
    if (
      window.ethereum &&
      settings.walletType !== 'binance' &&
      checkIsValidNetwork(settings.walletType)
    ) {
      window.ethereum.on('accountsChanged', accs => {
        setSetting({
          selectedAddress: accs[0],
          accountLoading: true
        });
      });
    }
  }, [window.ethereum, settings.selectedAddress]);

  const updateMarketInfo = async () => {
    const accountAddress = settings.selectedAddress;
    if (!accountAddress || !settings.decimals || !settings.markets || isMarketInfoUpdating) {
      return;
    }
    const appContract = getComptrollerContract();
    const vaiContract = getVaiTokenContract();

    setMarketInfoUpdating(true);

    try {
      let [vaultVaiStaked, venusVAIVaultRate] = await Promise.all([
        methods.call(vaiContract.methods.balanceOf, [constants.CONTRACT_VAI_VAULT_ADDRESS]),
        methods.call(appContract.methods.bidaoBAIVaultRate, [])
      ]);
  
      // Total Vai Staked
      vaultVaiStaked = new BigNumber(vaultVaiStaked).div(1e18);

      // venus vai vault rate
      venusVAIVaultRate = new BigNumber(venusVAIVaultRate).div(1e18).times(20 * 60 * 24);

      // VAI APY

      const xvsMarket = settings.markets.find(
        ele => ele.underlyingSymbol === 'XBID'
      );
      const vaiAPY = new BigNumber(venusVAIVaultRate)
        .times(xvsMarket.tokenPrice)
        .times(365 * 100)
        .div(vaultVaiStaked)
        .dp(2, 1)
        .toString(10);

      const totalLiquidity = (settings.markets || []).reduce((accumulator, market) => {
        return new BigNumber(accumulator).plus(
          new BigNumber(market.totalSupplyUsd)
        );
      }, vaultVaiStaked);
      setSetting({
        vaiAPY,
        vaultVaiStaked,
      });

      setTVL(totalLiquidity);
      setMarketInfoUpdating(false);
    } catch (error) {
      console.log(error);
      setMarketInfoUpdating(false);
    }
  };

  const handleAccountChange = async () => {
    await updateMarketInfo();
    setSetting({
      accountLoading: false
    });
  };

  useEffect(() => {
    updateMarketInfo();
  }, [settings.markets]);

  useEffect(() => {
    if (!settings.selectedAddress) return;
    handleAccountChange();
  }, [settings.selectedAddress]);

  const handleSelectedMenu = (item) => {
    setSelectedMenu(item.id);
    setMenuItem(item);
    setSelectedPath('');
  };

  const handleHoverMenu = (id) => {
    setHoverMenu(id);
  };

  const handleLeaveMenu = () => {
    setHoverMenu('');
  };

  const handleMenu = (item) => {
    setMenuItem(item);
    setSelectedMenu(item.id);
    setSelectedPath('');
    setMobileRedirect(true);
  };

  useEffect(() => {
    setSelectedPath(path === '/' ? '/dashboard' : path);
  }, [path]);

  return (
    <>
      {mobileRedirect && <Redirect to={menuItem.to} />}
      <HeaderContainer>
        <HeaderWrapper>
          <TopbarWrapper>
            <div className="container d-flex justify-content-between align-items-center">
              <NavLink to="/" className="logo-wrapper">
                <img src={logoImage} />
              </NavLink>
              <TopMenu>
                <Nav className="top-menu">
                  {topMenuItems.map((item, index) => {
                    if (!item.child)
                      return (
                        <NavItem
                          key={`__key-${index.toString()}`}
                          className={
                            selectedMenu === item.id || selectedPath === item.to
                              ? 'active'
                              : ''
                          }
                        >
                          <a
                            href={item.to}
                            className={
                              selectedMenu === item.id ||
                              selectedPath === item.to
                                ? 'menu-active'
                                : ''
                            }
                            onClick={() => handleSelectedMenu(item)}
                            onMouseOver={() => handleHoverMenu(item.id)}
                            onMouseLeave={() => handleLeaveMenu()}
                          >
                            {item.icon && (
                              <img src={item.icon} alt={item.label} />
                            )}
                            {item.label}
                          </a>
                        </NavItem>
                      );
                    return (
                      <UncontrolledDropdown
                        key={`__key-${index.toString()}`}
                        nav
                        inNavbar
                      >
                        <DropdownToggle nav caret>
                          {item.icon && (
                            <img src={item.icon} alt={item.label} />
                          )}
                          {item.label}
                        </DropdownToggle>
                        <DropdownMenu right>
                          {item.child.map((child, childIndex) => {
                            return (
                              <DropdownItem key={childIndex.toString()}>
                                {child.icon && (
                                  <img
                                    src={child.icon && child.icon}
                                    alt={child.label}
                                    width={20}
                                    height={20}
                                  />
                                )}
                                {child.label}
                              </DropdownItem>
                            );
                          })}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    );
                  })}
                </Nav>
                <ConnectButton>
                  {!settings.selectedAddress && (
                    <Button
                      className="connect-btn"
                      onClick={() => {
                        setIsOpenModal(true);
                      }}
                    >
                      Connect
                    </Button>
                  )}
                </ConnectButton>
              </TopMenu>
            </div>
          </TopbarWrapper>
          <div className="menu-wrapper">
            <Nav className="container d-flex justify-content-between align-items-center">
              {menuItems.map((item, index) => {
                return (
                  <NavItem
                    key={`__key-${index.toString()}`}
                    className={
                      selectedMenu === item.id || selectedPath === item.to
                        ? 'active'
                        : ''
                    }
                  >
                    <NavLink
                      to={item.to}
                      className={
                        selectedMenu === item.id || selectedPath === item.to
                          ? 'menu-active'
                          : ''
                      }
                      onClick={() => handleSelectedMenu(item)}
                      onMouseOver={() => handleHoverMenu(item.id)}
                      onMouseLeave={() => handleLeaveMenu()}
                    >
                      {item.label}
                    </NavLink>
                  </NavItem>
                );
              })}
            </Nav>
          </div>
        </HeaderWrapper>
        <HeroSection show={path == '/dashboard'}>
          <div className="hero-text d-flex justify-content-center align-items-end flex-column">
            <h1 className="">
              <span className="text-primary">Bidao</span> Exchange
            </h1>
            <p className="text-secondary">By Bidao</p>
          </div>
        </HeroSection>
      </HeaderContainer>
      <ConnectModal
        visible={isOpenModal}
        web3={web3}
        error={error}
        wcUri={wcUri}
        awaiting={awaiting}
        onCancel={() => setIsOpenModal(false)}
        onConnectMetaMask={handleMetaMask}
        onBack={() => setWcUri(null)}
      />
    </>
  );
};


TopHeader.propTypes = {
  history: PropTypes.object,
  settings: PropTypes.object,
  setSetting: PropTypes.func.isRequired,
  getGovernanceVenus: PropTypes.func.isRequired
};

TopHeader.defaultProps = {
  settings: {},
  history: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

const mapDispatchToProps = dispatch => {
  const { setSetting, getGovernanceVenus } = accountActionCreators;

  return bindActionCreators(
    {
      setSetting,
      getGovernanceVenus
    },
    dispatch
  );
};

export default compose(
  withRouter,
  connectAccount(mapStateToProps, mapDispatchToProps)
)(TopHeader);

