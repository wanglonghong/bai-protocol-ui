import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Input, Form, Dropdown, Menu } from 'antd';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { bindActionCreators } from 'redux';
import { connectAccount, accountActionCreators } from 'core';
import MainLayout from 'containers/Layout/MainLayout';
import { promisify } from 'utilities';
import Button from '@material-ui/core/Button';
import LoadingSpinner from 'components/Basic/LoadingSpinner';
import toast from 'components/Basic/Toast';
import * as constants from 'utilities/constants';
import { Row, Column } from 'components/Basic/Style';
import { getFaucetContract, methods } from 'utilities/ContractService';
import BigNumber from 'bignumber.js';

const FaucetWrapper = styled.div`
  width: 100%;
  max-width: 700px;
  height: 100%;
  flex: 1;
  padding: 20px;
  input {
    width: 100%;
    height: 42px;
  }

  .header {
    font-size: 36px;
    font-weight: 600;
    color: var(--color-text-main);
    margin-top: 100px;
    margin-bottom: 30px;
    text-align: center;

    @media only screen and (max-width: 768px) {
      font-size: 28px;
      margin-top: 0px;
    }
  }

  .bottom {
    color: var(--color-text-main);
    padding: 30px 0;

    .title {
      font-size: 24px;
      font-weight: 600;
    }

    .description {
      margin-top: 10px;
      font-size: 16px;
      font-weight: normal;
      text-align: center;
    }
  }

  .button-section {
    margin: 20px 0;
  }

  .empty-menu {
    opacity: 0;

    @media only screen and (max-width: 768px) {
      display: none;
    }
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px;
  .button {
    width: 150px;
    height: 40px;
    border-radius: 5px;
    background-image: linear-gradient(to right,rgb(28,183,247),rgb(18,153,207));
    .MuiButton-label {
      font-size: 15px;
      font-weight: 500;
      color: var(--color-text-main);
      text-transform: capitalize;

      @media only screen and (max-width: 1440px) {
        font-size: 12px;
      }
    }
  }
`;

function Faucet({ settings }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMenuClick = async (e, symbol) => {
    setIsLoading(true);
    let amount =  new BigNumber(e.key)
            .times(1e18)
            .integerValue()
            .toString(10);

    let fromAddress;
    if (symbol === 'xbid') {
      fromAddress = constants.CONTRACT_XVS_TOKEN_ADDRESS;
    } else if (symbol === 'bnb') {
      fromAddress = constants.CONTRACT_XVS_TOKEN_ADDRESS;
    } else {
      fromAddress = constants.CONTRACT_TOKEN_ADDRESS[symbol].address;
    }

    const faucetContract = getFaucetContract();
    const remainSeconds = await methods.call(
      faucetContract.methods.remainSeconds,
      [settings.selectedAddress, fromAddress]
    );

    if(remainSeconds > 0) {
        const remainTime = new Date(remainSeconds * 1000).toISOString().substr(11, 8);
        toast.error({
          title: `${remainTime} left until next allowance`
        });
        setIsLoading(false);
        return;
    } else {
      methods
      .send(
        faucetContract.methods.claim,
        [fromAddress, amount],
        settings.selectedAddress
      )
      .then(() => {
        setIsLoading(false);
        toast.success({
          title: `Funding request into ${settings.selectedAddress}`
        });
      })
      .catch(() => {
        setIsLoading(false);
        toast.error({
          title: `Funding request into ${settings.selectedAddress}`
        });
      });
    }
    
  
    // form.validateFields((err, values) => {
    //   if (!err) {
    //     setIsLoading(true);
    //     promisify(getFromFaucet, {
    //       address: values.address,
    //       asset: symbol,
    //       amountType: e.key
    //     })
    //       .then(() => {
    //         setIsLoading(false);
    //         let fromAddress;
    //         if (symbol === 'xbid') {
    //           fromAddress = constants.CONTRACT_XVS_TOKEN_ADDRESS;
    //         } else if (symbol === 'bnb') {
    //           fromAddress = constants.CONTRACT_XVS_TOKEN_ADDRESS;
    //         } else {
    //           fromAddress = constants.CONTRACT_TOKEN_ADDRESS[symbol].address;
    //         }
    //         toast.success({
    //           title: `Funding request for ${fromAddress} into ${values.address}`
    //         });
    //       })
    //       .catch(error => {
    //         if (error.data && error.data.message) {
    //           toast.error({
    //             title: error.data.message
    //           });
    //         }
    //         setIsLoading(false);
    //       });
    //   }
    // });
  };

  const handleBNBMenuClick = () => {
    window.open('https://testnet.binance.org/faucet-smart', '_blank')
  }

  const busdMenu = (
    <Menu onClick={e => handleMenuClick(e, 'busd')}>
      <Menu.Item key="20">20 BUSDs</Menu.Item>
      <Menu.Item key="50">50 BUSDs</Menu.Item>
      <Menu.Item key="100">100 BUSDs</Menu.Item>
    </Menu>
  );

  const bnbMenu = (
    <Menu onClick={e => handleMenuClick(e, 'bnb')}>
      <Menu.Item key="1">1 BNB</Menu.Item>
      <Menu.Item key="2.5">2.5 BNBs</Menu.Item>
      <Menu.Item key="5">5 BNBs</Menu.Item>
    </Menu>
  );

  const sxpMenu = (
    <Menu onClick={e => handleMenuClick(e, 'xdao')}>
      <Menu.Item key="20">20 XDAOs</Menu.Item>
      <Menu.Item key="50">50 XDAOs</Menu.Item>
      <Menu.Item key="100">100 XDAOs</Menu.Item>
    </Menu>
  );

  const xvsMenu = (
    <Menu onClick={e => handleMenuClick(e, 'xbid')}>
      <Menu.Item key="20">20 XBIDs</Menu.Item>
      <Menu.Item key="50">50 XBIDs</Menu.Item>
      <Menu.Item key="100">100 XBIDs</Menu.Item>
    </Menu>
  );

  const btcbMenu = (
    <Menu onClick={e => handleMenuClick(e, 'btcb')}>
      <Menu.Item key="20">20 BTCBs</Menu.Item>
      <Menu.Item key="50">50 BTCBs</Menu.Item>
      <Menu.Item key="100">100 BTCBs</Menu.Item>
    </Menu>
  );

  const ethMenu = (
    <Menu onClick={e => handleMenuClick(e, 'eth')}>
      <Menu.Item key="20">20 ETHs</Menu.Item>
      <Menu.Item key="50">50 ETHs</Menu.Item>
      <Menu.Item key="100">100 ETHs</Menu.Item>
    </Menu>
  );

  const adaMenu = (
    <Menu onClick={e => handleMenuClick(e, 'ada')}>
      <Menu.Item key="20">20 ADAs</Menu.Item>
      <Menu.Item key="50">50 ADAs</Menu.Item>
      <Menu.Item key="100">100 ADAs</Menu.Item>
    </Menu>
  );

  const xrpMenu = (
    <Menu onClick={e => handleMenuClick(e, 'xrp')}>
      <Menu.Item key="20">20 XRPs</Menu.Item>
      <Menu.Item key="50">50 XRPs</Menu.Item>
      <Menu.Item key="100">100 XRPs</Menu.Item>
    </Menu>
  );
  

  return (
    <MainLayout isHeader={false}>
      <div className="flex just-center align-center">
        <FaucetWrapper className="flex flex-column align-center just-center">
          <p className="header">Bidao  Faucet</p>
          <div className="forgot-pwd-form">

            
            {!settings.selectedAddress || isLoading ? (
              <div className="flex flex-column" style={{margin: '50px'}}>
                <LoadingSpinner size={60} />
              </div>
            ) : (
              <>
                <Row>
                    <Column xs="12">
                      <div className="flex flex-column align-center just-center bottom">
                        <p className="description">
                          {settings.selectedAddress}
                        </p>
                      </div>
                      </Column>
                </Row>  
                <Row>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Button className="fill-btn next-btn button" onClick={handleBNBMenuClick}>
                        Give Me BNB
                      </Button>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Dropdown overlay={sxpMenu} placement="bottomCenter">
                        <Button className="fill-btn next-btn button">
                          Give Me XDAO
                        </Button>
                      </Dropdown>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Dropdown overlay={xvsMenu} placement="bottomCenter">
                        <Button className="fill-btn next-btn button">
                          Give Me XBID
                        </Button>
                      </Dropdown>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Dropdown overlay={busdMenu} placement="bottomCenter">
                        <Button className="fill-btn next-btn button">
                          Give Me BUSD
                        </Button>
                      </Dropdown>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Dropdown overlay={btcbMenu} placement="bottomCenter">
                        <Button className="fill-btn next-btn button">
                          Give Me BTCB
                        </Button>
                      </Dropdown>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Dropdown overlay={ethMenu} placement="bottomCenter">
                        <Button className="fill-btn next-btn button">
                          Give Me ETH
                        </Button>
                      </Dropdown>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Dropdown overlay={xrpMenu} placement="bottomCenter">
                        <Button className="fill-btn next-btn button">
                          Give Me XRP
                        </Button>
                      </Dropdown>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4">
                    <ButtonWrapper>
                      <Dropdown overlay={adaMenu} placement="bottomCenter">
                        <Button className="fill-btn next-btn button">
                          Give Me ADA
                        </Button>
                      </Dropdown>
                    </ButtonWrapper>
                  </Column>
                  <Column xs="6" sm="4" className="empty-menu">
                    <ButtonWrapper />
                  </Column>
                </Row>
              </>
            )}
          </div>
          <div className="flex flex-column align-center just-center bottom">
            <p className="title">How does this work?</p>
            <p className="description">
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_TOKEN_ADDRESS.xdao.address}`}
                target="_blank"
                rel="noreferrer"
              >
                XDAO
              </a>
              {`, `}
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_XVS_TOKEN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                XBID
              </a>
              {`, `}
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_TOKEN_ADDRESS.busd.address}`}
                target="_blank"
                rel="noreferrer"
              >
                BUSD
              </a>
              {`, `}
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_VAI_TOKEN_ADDRESS}`}
                target="_blank"
                rel="noreferrer"
              >
                BAI
              </a>
              {`, `}
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_TOKEN_ADDRESS.btcb.address}`}
                target="_blank"
                rel="noreferrer"
              >
                BTCB
              </a>
              {`, `}
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_TOKEN_ADDRESS.eth.address}`}
                target="_blank"
                rel="noreferrer"
              >
                ETH
              </a>
              {`, `}
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_TOKEN_ADDRESS.xrp.address}`}
                target="_blank"
                rel="noreferrer"
              >
                XRP
              </a>
              {`, `}
              <a
                href={`${process.env.REACT_APP_BSC_EXPLORER}/address/${constants.CONTRACT_TOKEN_ADDRESS.ada.address}`}
                target="_blank"
                rel="noreferrer"
              >
                ADA
              </a>
              {` are issued as BEP20 token.`}
            </p>
            <p className="description">
              Click to get detail about{' '}
              <a
                href="https://github.com/binance-chain/BEPs/blob/master/BEP20.md"
                target="_blank"
                rel="noreferrer"
              >
                BEP20
              </a>
            </p>
          </div>
        </FaucetWrapper>
      </div>
    </MainLayout>
  );
}

Faucet.propTypes = {
  settings: PropTypes.object
};

Faucet.defaultProps = {
  settings: {}
};

const mapStateToProps = ({ account }) => ({
  settings: account.setting
});

const mapDispatchToProps = dispatch => {
  
};

export default compose(
  withRouter,
  connectAccount(mapStateToProps, mapDispatchToProps)
)(Faucet);
