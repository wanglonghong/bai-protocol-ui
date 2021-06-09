import styled from 'styled-components';
import HeroImage from 'assets/img/bannerimg.jpg';

export const HeaderContainer = styled.div`
  width: 100%;
`;

export const HeaderWrapper = styled.div`
  position: fixed;
  left: 0;
  width: 100%;
  background-color: var(--color-bg-primary);
  box-shadow: 0 1px 6px 0 rgba(0, 0, 0, 0.2);
  z-index: 9;
`;

export const TopbarWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 65px;
  padding: 0 10px;
  background-image: linear-gradient(90deg, #000f2a, #022557);
`;

export const TopMenu = styled.div`
  display: flex;
  position: relative;
  align-items: center;
`;

export const HeroSection = styled.div`  
  ${({ show }) => show && `
    display: flex;
    padding: 3rem;
    padding-top: 150px;
    background: url(${HeroImage});
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
  `}
  ${({ show }) => !show && `
    display: flex;
    height: 110px;
    padding-top: 0px;
  `}
  align-items: center;
  justify-content: center;
`;
