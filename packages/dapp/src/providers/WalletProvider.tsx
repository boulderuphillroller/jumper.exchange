import type { Signer } from '@ethersproject/abstract-signer';
import { Token } from '@lifi/sdk';
import {
  LiFiWalletManagement,
  Wallet,
  readActiveWallets,
  supportedWallets,
} from '@lifi/wallet-management';

import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  WalletAccount,
  WalletContextProps,
} from '@transferto/shared/src/types/wallet';
import {
  TrackingAction,
  TrackingCategory,
  TrackingEventParameter,
} from '../const';
import { useUserTracking } from '../hooks';
import { useMultisig } from '../hooks/useMultisig';
import { EventTrackingTool, WalletActions } from '../types';

const liFiWalletManagement = new LiFiWalletManagement();

const stub = (): never => {
  throw new Error('You forgot to wrap your component in <WalletProvider>.');
};

export const initialContext: WalletContextProps = {
  connect: stub,
  disconnect: stub,
  switchChain: stub,
  addChain: stub,
  addToken: stub,
  account: {},
};

const WalletContext = createContext<WalletContextProps>(initialContext);

export const useWallet = (): WalletContextProps =>
  React.useContext(WalletContext);

export const WalletProvider: React.FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  const [account, setAccount] = useState<WalletAccount>({});
  const [currentWallet, setCurrentWallet] = useState<Wallet | undefined>();
  const {
    trackEvent,
    trackDisconnectWallet,
    trackChainSwitch,
    trackConnectWallet,
  } = useUserTracking();
  const { checkMultisigEnvironment } = useMultisig();

  const connectMultisigWallet = async () => {
    const isMultisig = await checkMultisigEnvironment();

    if (!isMultisig) {
      return;
    }

    const multisigWallet = supportedWallets.find(
      (wallet) => wallet.name === 'Safe',
    );
    if (multisigWallet) {
      await liFiWalletManagement.connect(multisigWallet);
    }
  };

  // autoConnect
  useEffect(() => {
    const autoConnect = async () => {
      await connectMultisigWallet();
      const persistedActiveWallets = readActiveWallets();
      const activeWallets = supportedWallets.filter((wallet) =>
        persistedActiveWallets.some(
          (perstistedWallet) => perstistedWallet.name === wallet.name,
        ),
      );
      if (!activeWallets.length) {
        return;
      }
      await liFiWalletManagement.autoConnect(activeWallets);
      activeWallets[0].on('walletAccountChanged', handleWalletUpdate);
      handleWalletUpdate(activeWallets[0]);
    };
    autoConnect();
    // fixing: disconnect only works on 2nd attempt
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleWalletUpdate = useCallback(
    async (
      wallet?: Wallet,
      walletAction?: WalletActions,
      token?: Token,
      chainId?: number,
    ) => {
      setCurrentWallet(wallet);
      const account = await extractAccountFromSigner(wallet?.account?.signer);
      if (walletAction) {
        switch (walletAction) {
          case WalletActions.Connect:
            trackConnectWallet({ account, wallet });
            break;
          case WalletActions.SwitchChain:
            trackChainSwitch({
              account,
              action: TrackingAction.SwitchChain,
              label: 'switch-chain',
              category: TrackingCategory.Wallet,
              data: {
                [TrackingEventParameter.SwitchedChain]: chainId,
              },
              disableTrackingTool: [
                EventTrackingTool.ARCx,
                EventTrackingTool.Cookie3,
                EventTrackingTool.Hotjar,
              ],
            });
            break;
          case WalletActions.AddChain:
            trackEvent({
              action: TrackingAction.AddChain,
              category: TrackingCategory.Wallet,
              label: 'add-chain',
              data: {
                [TrackingEventParameter.ChainIdAdded]: chainId,
              },
            });
            break;
          case WalletActions.AddToken:
            trackEvent({
              action: TrackingAction.AddToken,
              label: 'add-token',
              category: TrackingCategory.Wallet,
              data: {
                [TrackingEventParameter.AddedTokenAddress]: token?.address,
                [TrackingEventParameter.AddedTokenName]: token?.name,
              },
            });
            break;
          default:
            console.warn('No wallet action detected');
            break;
        }
      }
      setAccount(account);
    },
    [trackChainSwitch, trackConnectWallet, trackEvent],
  );

  const connect = useCallback(
    async (wallet: Wallet) => {
      await liFiWalletManagement.connect(wallet);
      wallet.on('walletAccountChanged', handleWalletUpdate);
      handleWalletUpdate(wallet, WalletActions.Connect);
    },
    [handleWalletUpdate],
  );

  const disconnect = useCallback(async () => {
    if (currentWallet) {
      await liFiWalletManagement.disconnect(currentWallet);
      currentWallet.removeAllListeners();
      // Disconnect action tracked over here since wallet gets updated to undefined value after disconection occures
      trackDisconnectWallet({
        account,
        data: { [TrackingEventParameter.Wallet]: currentWallet.name },
        disableTrackingTool: [EventTrackingTool.GA],
      });
      handleWalletUpdate(undefined);
    }
  }, [account, currentWallet, handleWalletUpdate, trackDisconnectWallet]);

  const switchChain = useCallback(
    async (chainId: number) => {
      try {
        await currentWallet?.switchChain(chainId);
        handleWalletUpdate(
          currentWallet,
          WalletActions.SwitchChain,
          undefined,
          chainId,
        );
        return true;
      } catch {
        return false;
      }
    },
    [currentWallet, handleWalletUpdate],
  );

  const addChain = useCallback(
    async (chainId: number) => {
      try {
        await currentWallet?.addChain(chainId);
        handleWalletUpdate(
          currentWallet,
          WalletActions.AddChain,
          undefined,
          chainId,
        );
        return true;
      } catch {
        return false;
      }
    },
    [currentWallet, handleWalletUpdate],
  );

  const addToken = useCallback(
    async (chainId: number, token: Token) => {
      await currentWallet?.addToken(chainId, token);
      handleWalletUpdate(currentWallet, WalletActions.AddChain, token, chainId);
      return;
    },
    [currentWallet, handleWalletUpdate],
  );

  const value = useMemo(
    () => ({
      connect,
      disconnect,
      switchChain,
      addChain,
      addToken,
      account,
      usedWallet: currentWallet,
    }),
    [
      account,
      addChain,
      addToken,
      connect,
      disconnect,
      switchChain,
      currentWallet,
    ],
  );

  return (
    <WalletContext.Provider value={value}> {children} </WalletContext.Provider>
  );
};

const extractAccountFromSigner = async (
  signer?: Signer,
): Promise<WalletAccount> => {
  try {
    return {
      address: (await signer?.getAddress()) || undefined,
      isActive: (signer && !!(await signer.getAddress()) === null) || !!signer,
      signer,
      chainId: (await signer?.getChainId()) || undefined,
    };
  } catch {
    return {} as WalletAccount;
  }
};
