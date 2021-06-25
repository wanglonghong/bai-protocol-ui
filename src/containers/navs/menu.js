export const topMenuItems = [
  {
    id: 'home',
    icon: null,
    label: 'Home',
    to: '/',
    child: null,
  },
  {
    id: 'explorer',
    icon: null,
    label: 'Explorer',
    to: 'http://207.180.229.50/',
    child: null,
  },
  {
    id: 'website',
    icon: null,
    label: 'Website',
    to: 'https://bidaochain.org/',
    child: null,
  },
  {
    id: 'token-info',
    icon: null,
    label: 'Token Info',
    to: '',
    child: null,
  },
  {
    id: 'faucet',
    icon: null,
    label: 'Get Tokens',
    to: '/faucet',
    child: null,
  },
  // {
  //   id: 'wallets',
  //   icon: null,
  //   label: 'Wallets',
  //   to: '',
  //   child: [
  //     {
  //       id: 'ios',
  //       icon: null,
  //       label: 'IOS',
  //       to: '',
  //     },
  //     {
  //       id: 'android',
  //       icon: null,
  //       label: 'ANDROID',
  //       to: '',
  //     },
  //   ],
  // },
  // {
  //   id: 'contact-us ',
  //   icon: null,
  //   label: 'Contact Us',
  //   to: '',
  //   child: null,
  // },
];
const data = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/dashboard',
  },
  {
    id: 'vote',
    label: 'Vote',
    to: '/vote',
  },
  {
    id: 'xvs',
    label: 'XBID',
    to: '/xbid',
  },
  {
    id: 'market',
    label: 'Market',
    to: '/market',
  },
  {
    id: 'vault',
    label: 'Vault',
    to: '/vault',
  },
];

if(process.env.REACT_APP_ENV === 'dev') {
  data.push({
    id: 'faucet',
    label: 'Faucet',
    to: '/faucet',
  })
}
export default data;
