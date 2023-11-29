import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { Breakpoint, CSSObject } from '@mui/material';
import { Container, Typography, useTheme } from '@mui/material';
import type { MenuKeys } from 'src/const';
import {
  TrackingAction,
  TrackingCategory,
  TrackingEventParameter,
} from 'src/const';
import { Button } from 'src/components';
import { useUserTracking } from 'src/hooks';
import { useMenuStore } from 'src/stores';
import { EventTrackingTool } from 'src/types';
import type { JsxElement } from 'typescript';
import { PopperItemContainer, PopperItemLabel } from '.';

interface MenuItemProps {
  open: boolean;
  showButton: boolean | undefined;
  children?: Element | JsxElement | undefined;
  disableRipple?: boolean | undefined;
  autoFocus?: boolean;
  showMoreIcon?: boolean;
  styles?: CSSObject;
  label?: string;
  onClick: any;
  triggerSubMenu?: MenuKeys;
  prefixIcon?: JSX.Element | string;
  suffixIcon?: JSX.Element | string;
  checkIcon?: boolean;
}

export const PopperItem = ({
  open,
  showButton,
  autoFocus,
  disableRipple,
  children,
  showMoreIcon = true,
  styles,
  onClick,
  label,
  triggerSubMenu,
  prefixIcon,
  suffixIcon,
}: MenuItemProps) => {
  const theme = useTheme();
  const { trackEvent } = useUserTracking();
  const [onOpenSubMenuPopper] = useMenuStore((state) => [
    state.onOpenSubMenuPopper,
  ]);

  const handleClick = () => {
    triggerSubMenu && onOpenSubMenuPopper(triggerSubMenu);
    triggerSubMenu &&
      trackEvent({
        category: TrackingCategory.MainMenu,
        action: TrackingAction.OpenMenu,
        label: `open_submenu_${triggerSubMenu.toLowerCase()}`,
        data: { [TrackingEventParameter.Menu]: triggerSubMenu },
        disableTrackingTool: [
          EventTrackingTool.ARCx,
          EventTrackingTool.Cookie3,
        ],
      });
    !!onClick && onClick();
  };

  return open ? (
    <PopperItemContainer
      disableRipple={disableRipple || showButton}
      showButton={showButton || false}
      sx={styles}
      autoFocus={autoFocus}
      onClick={() => {
        !children && handleClick();
      }}
    >
      <>
        {children}
        {showButton && (
          <Button variant="primary" styles={styles} fullWidth={true}>
            {prefixIcon}
            <Typography
              variant={'lifiBodyMediumStrong'}
              component={'span'}
              ml={!!prefixIcon ? '9.5px' : 'inherit'}
              mr={!!prefixIcon ? '9.5px' : 'inherit'}
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '208px',
                [theme.breakpoints.up('sm' as Breakpoint)]: {
                  maxWidth: '168px',
                },
              }}
            >
              {label}
            </Typography>
            {suffixIcon ?? null}
          </Button>
        )}
        {!showButton && (
          <>
            <PopperItemLabel
              variant={
                suffixIcon && showMoreIcon
                  ? 'xs'
                  : !suffixIcon && !showMoreIcon
                  ? 'lg'
                  : 'md'
              }
            >
              {prefixIcon ?? null}
              {label ? (
                <Typography
                  variant={'lifiBodyMedium'}
                  ml={'12px'}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    [theme.breakpoints.up('sm' as Breakpoint)]: {
                      maxWidth: prefixIcon ? '188px' : 'inherit',
                    },
                  }}
                >
                  {label}
                </Typography>
              ) : null}
            </PopperItemLabel>
            {suffixIcon ||
              (showMoreIcon && (
                <div
                  style={{
                    display: suffixIcon || showMoreIcon ? 'flex' : 'none',
                    alignItems: 'center',
                  }}
                >
                  {suffixIcon ?? null}
                  {showMoreIcon ? (
                    <ChevronRightIcon sx={{ ml: theme.spacing(1) }} />
                  ) : null}
                </div>
              ))}
          </>
        )}
      </>
    </PopperItemContainer>
  ) : null;
};
