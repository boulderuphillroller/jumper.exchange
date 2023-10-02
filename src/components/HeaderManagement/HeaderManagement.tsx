import MenuIcon from '@mui/icons-material/Menu';
import { Typography } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainSwitch, PopperToggle, ThemeSwitch } from 'src/components';
import {
  TrackingAction,
  TrackingCategory,
  TrackingEventParameter,
} from 'src/const';
import { useChains, useUserTracking } from 'src/hooks';
import { WalletManagementButtons } from 'src/organisms';
import { useWallet } from 'src/providers';
import { useMenuStore, useSettingsStore } from 'src/stores';
import { EventTrackingTool } from 'src/types';
import { HeaderManagementContainer as Container } from '.';

export const HeaderManagement = () => {
  const mainMenuAnchor = useRef<any>(null);
  const { trackEvent } = useUserTracking();

  const onWalletDisconnect = useSettingsStore(
    (state) => state.onWalletDisconnect,
  );

  const [openMainPopperMenu, onOpenNavbarMainMenu] = useMenuStore((state) => [
    state.openMainPopperMenu,
    state.onOpenNavbarMainMenu,
  ]);

  const { t } = useTranslation();
  const walletManagement = useWallet();
  const { account } = useWallet();
  !account.isActive ?? onWalletDisconnect();

  // return focus to the button when we transitioned from !open -> open
  const prevMainMenu = useRef(openMainPopperMenu);
  useEffect(() => {
    if (prevMainMenu.current === true && openMainPopperMenu === false) {
      mainMenuAnchor!.current.focus();
    }

    prevMainMenu.current = openMainPopperMenu;
  }, [openMainPopperMenu]);

  const { isSuccess } = useChains();

  const handleOnOpenNavbarMainMenu = () => {
    onOpenNavbarMainMenu(!openMainPopperMenu, mainMenuAnchor.current);
    trackEvent({
      category: TrackingCategory.Menu,
      action: TrackingAction.OpenMenu,
      label: 'open_main_menu',
      data: { [TrackingEventParameter.Menu]: 'main_menu' },
      disableTrackingTool: [EventTrackingTool.Raleon, EventTrackingTool.ARCx],
    });
  };

  return (
    <Container className="settings">
      <WalletManagementButtons
        walletManagement={walletManagement}
        connectButtonLabel={
          <Typography
            variant={'lifiBodyMediumStrong'}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
            }}
          >
            {t('navbar.connectWallet')}
          </Typography>
        }
        isSuccess={isSuccess}
      />
      {account.isActive ? <ChainSwitch /> : null}
      <ThemeSwitch />
      <PopperToggle
        ref={mainMenuAnchor}
        id="composition-button"
        aria-controls={openMainPopperMenu ? 'composition-menu' : undefined}
        aria-expanded={openMainPopperMenu ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleOnOpenNavbarMainMenu}
      >
        <MenuIcon
          sx={{
            fontSize: '32px',
            color: 'inherit',
          }}
        />
      </PopperToggle>
    </Container>
  );
};
