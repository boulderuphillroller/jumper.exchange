import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useUserTracking } from 'src/hooks';
import { useMenuStore } from 'src/stores';
import { EventTrackingTool } from 'src/types';
import { openInNewTab } from 'src/utils';
export const useDevelopersContent = () => {
  const { t } = useTranslation();
  const { trackPageload } = useUserTracking();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const onCloseAllPopperMenus = useMenuStore(
    (state) => state.onCloseAllPopperMenus,
  );

  return [
    {
      label: t('navbar.developers.github'),
      prefixIcon: (
        <GitHubIcon
          sx={{
            color: isDarkMode
              ? theme.palette.white.main
              : theme.palette.black.main,
          }}
        />
      ),
      onClick: () => {
        const githubUrl = 'https://github.com/lifinance/';
        openInNewTab(githubUrl);
        trackPageload({
          source: 'menu',
          destination: 'lifi-github',
          url: githubUrl,
          pageload: true,
          disableTrackingTool: [
            EventTrackingTool.ARCx,
            EventTrackingTool.Raleon,
          ],
        });
        onCloseAllPopperMenus();
      },
    },
    {
      label: t('navbar.developers.documentation'),
      prefixIcon: <DescriptionOutlinedIcon />,
      onClick: () => {
        const docsUrl = 'https://docs.li.fi/';
        openInNewTab(docsUrl);
        trackPageload({
          source: 'menu',
          destination: 'lifi-docs',
          url: docsUrl,
          pageload: true,
          disableTrackingTool: [
            EventTrackingTool.ARCx,
            EventTrackingTool.Raleon,
          ],
        });
        onCloseAllPopperMenus();
      },
    },
  ];
};
