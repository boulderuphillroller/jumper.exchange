import type { TabProps, TabsProps } from '@mui/material';
import { Tab as MUITab, Tabs } from '@mui/material';
import type { Breakpoint } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { getContrastAlphaColor } from 'src/utils';

export const TabsContainer = styled(Tabs, {
  shouldForwardProp: (prop) => prop !== 'isDarkMode',
})<TabsProps & { isDarkMode: boolean }>(({ theme }) => ({
  display: 'none',
  minWidth: 392,
  [theme.breakpoints.up('md' as Breakpoint)]: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.alphaLight100.main
        : '#0000000A',
    margin: 'auto',
    borderRadius: 28,
    padding: 1,
    display: 'flex',
    alignItems: 'center',
  },
  div: {
    height: '56px',
  },
  '.MuiTabs-flexContainer': {
    alignItems: 'center',
  },
  '.MuiTabs-indicator': {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%) scaleY(0.98)',
    height: '48px',
    backgroundColor:
      theme.palette.mode === 'dark'
        ? theme.palette.alphaLight300.main
        : theme.palette.white.main,
    zIndex: '-1',
    borderRadius: '24px',
  },
  '> .MuiTabs-root': {
    minHeight: 'unset !important',
  },
  '.MuiTabs-root': {
    minHeight: 'unset !important',
  },
}));

export const Tab = styled(MUITab, {
  shouldForwardProp: (prop) => prop !== 'isDarkMode',
})<TabProps>(({ theme }) => ({
  textTransform: 'initial',
  borderRadius: 24,
  letterSpacing: 0,
  display: 'flex',
  flexGrow: 1,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  fontFamily: 'Inter',
  fontStyle: 'normal',
  fontWeight: '700',
  fontSize: '16px',
  lineHeight: '20px',
  margin: '6px 4px',
  height: '48px',
  width: '142px',
  minHeight: 'unset',
  color:
    theme.palette.mode === 'dark'
      ? theme.palette.white.main
      : theme.palette.black.main,
  textDecoration: 'none',
  '&.Mui-selected': {
    color:
      theme.palette.mode === 'dark'
        ? theme.palette.white.main
        : theme.palette.black.main,
    backgroundColor: 'transparent',
  },

  ':hover': {
    backgroundColor: getContrastAlphaColor(theme, '4%'),
  },
}));
