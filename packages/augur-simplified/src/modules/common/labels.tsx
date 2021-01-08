import React, { useMemo } from 'react';
import Styles from 'modules/common/labels.styles.less';
import { useLocation } from 'react-router';
import classNames from 'classnames';
import { formatDai } from 'utils/format-number';
import { createBigNumber } from 'utils/create-big-number';
import {
  AugurBlankIcon,
  EthIcon,
  PlusIcon,
  UsdIcon,
} from 'modules/common/icons';
import {
  POPULAR_CATEGORIES_ICONS,
  MODAL_ADD_LIQUIDITY,
  MARKET,
} from 'modules/constants';
import { useAppStatusStore } from 'modules/stores/app-status';
import parsePath from '../routes/helpers/parse-path';

interface ValueLabelProps {
  large?: boolean;
  label?: string;
  sublabel?: string;
  value: string | number;
  light?: boolean;
  className?: string;
}

export const ValueLabel = ({
  large,
  label,
  sublabel,
  value,
  light,
  className,
}: ValueLabelProps) => {
  return (
    <div
      className={classNames(Styles.ValueLabel, {
        [Styles.large]: large,
        [Styles.Sublabel]: sublabel,
        [Styles.light]: light,
      }, className)}
    >
      <span>{label}</span>
      {sublabel && <span>{sublabel}</span>}
      <span>{value}</span>
    </div>
  );
};

export const InlineValueLabel = ({label, value}) => (
  <div className={Styles.InlineValueLabel}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

interface IconLabelProps {
  icon: Object;
  value: string | number;
}

export const IconLabel = ({ icon, value }: IconLabelProps) => {
  return (
    <div className={classNames(Styles.IconLabel)}>
      <span>{icon}</span>
      <span>{value}</span>
    </div>
  );
};

interface CategoryProps {
  category: string;
}

export const CategoryLabel = ({ category }: CategoryProps) => {
  return <div className={classNames(Styles.CategoryLabel)}>{category}</div>;
};

interface CategoryProps {
  category: string;
}

export const CategoryIcon = ({ category }: CategoryProps) => {
  return (
    <div
      className={classNames(
        Styles.CategoryIcon,
        Styles[`${category.toLowerCase()}`]
      )}
    >
      {POPULAR_CATEGORIES_ICONS[category.toLowerCase()]
        ? POPULAR_CATEGORIES_ICONS[category.toLowerCase()]
        : AugurBlankIcon}
    </div>
  );
};

const ONE_HUNDRED_K = '100000.00';

const handleValue = (value) =>
  formatDai(value, {
    bigUnitPostfix: createBigNumber(value).gte(ONE_HUNDRED_K),
  }).full;

interface AppViewStatsProps {
  showCashAmounts?: boolean;
}

export const AppViewStats = ({ showCashAmounts }: AppViewStatsProps) => {
  const {
    isMobile,
    loginAccount,
    userInfo: { balances },
  } = useAppStatusStore();
  const isLogged = Boolean(loginAccount?.account);
  const totalAccountValue = useMemo(
    () => handleValue(isLogged ? balances?.totalAccountValue : 0),
    [isLogged, balances.totalAccountValue]
  );
  const positionsValue = useMemo(
    () => handleValue(isLogged ? balances?.totalPositionUsd : 0),
    [isLogged, balances.totalPositionUsd]
  );
  const availableFunds = useMemo(
    () => handleValue(isLogged ? balances?.availableFundsUsd : 0),
    [isLogged, balances.availableFundsUsd]
  );
  const usdValueETH = useMemo(
    () => handleValue(balances?.USDC?.usdValue || 0),
    [balances?.USDC?.usdValue]
  );
  const usdValueUSDC = useMemo(
    () => handleValue(balances?.ETH?.usdValue || 0),
    [balances?.ETH?.usdValue]
  );
  return (
    <div
      className={classNames(Styles.AppStats, {
        [Styles.CashAmounts]: showCashAmounts,
      })}
    >
      <ValueLabel
        large
        label={isMobile ? 'total acc. value' : 'total account value'}
        light={!isLogged}
        value={totalAccountValue}
      />
      <ValueLabel
        large
        label="positions"
        light={!isLogged}
        value={positionsValue}
      />
      <ValueLabel
        large
        light={!isLogged}
        label="available funds"
        value={availableFunds}
      />
      {showCashAmounts && (
        <>
          <IconLabel icon={EthIcon} value={usdValueETH} />
          <IconLabel icon={UsdIcon} value={usdValueUSDC} />
        </>
      )}
    </div>
  );
};

export const AddLiquidity = ({ market }) => {
  const {
    actions: { setModal },
  } = useAppStatusStore();
  return (
    <div
      className={classNames(Styles.AddLiquidity)}
      onClick={() => setModal({ type: MODAL_ADD_LIQUIDITY, market })}
    >
      <span>
        {PlusIcon}
        add liquidity
      </span>
      <span>earn fees as a liquidity provider</span>
    </div>
  );
};

export const ErrorBlock = ({ text }) => {
  return <div className={Styles.ErrorBlock}>{text}</div>;
};

export const NetworkMismatchBanner = () => {
  const {
    paraConfig: { networkId },
    loginAccount,
  } = useAppStatusStore();
  const location = useLocation();
  const path = parsePath(location.pathname)[0];
  const { chainId } = loginAccount || {};
  const isNetworkMismatch = useMemo(
    () => !!chainId && String(networkId) !== String(chainId),
    [chainId, networkId]
  );
  return (
    <>
      {isNetworkMismatch && (
        <article className={classNames(Styles.NetworkMismatch, {
          [Styles.Market]: path === MARKET,
        })}>
          You're connected to an unsupported network
        </article>
      )}
    </>
  );
};
