import React, { useState } from 'react';
import classNames from 'classnames';
import { useLocation, useHistory } from 'react-router';

import {
  TopRow,
  getCategoriesWithClick,
  SportsGroupMarkets,
  reduceToUniquePools,
} from 'modules/market-cards/common';
import { DISPUTING, MARKETS } from 'modules/routes/constants/views';
import makePath from 'modules/routes/helpers/make-path';
import {
  HEADER_TYPE,
  SPORTS_GROUP_TYPES,
  SPORTS_GROUP_MARKET_TYPES,
  MODAL_MARKET_RULES,
} from 'modules/common/constants';
import { CountdownProgress, formatTime } from 'modules/common/progress';
import Styles from 'modules/market-cards/sports-market-card.styles.less';
import MarketTitle from 'modules/market/components/common/market-title';
import { Rules, ThickChevron } from 'modules/common/icons';
import { LoadingCard } from 'modules/market-cards/market-card';
import { MarketData } from 'modules/types';
import { useAppStatusStore } from 'modules/app/store/app-status';


interface SportsMarketCardProps {
  sportsGroup: {
    id: string;
    type: string;
    markets: Array<MarketData>;
    marketTypes: Array<string>;
  };
  loading: boolean;
}

const { COMBO, FUTURES, DAILY } = SPORTS_GROUP_TYPES;

const { MONEY_LINE } = SPORTS_GROUP_MARKET_TYPES;

const determineStartState = ({ type, marketTypes }) => {
  if (type === FUTURES) return true;
  // if (type !== DAILY) return false;
  // const hasMoneyLineMarket = marketTypes.find(uniqueType =>
  //   uniqueType.includes(MONEY_LINE)
  // );

  return marketTypes.length <= 4;
};

export const SportsMarketCard = ({
  sportsGroup,
  loading,
}: SportsMarketCardProps) => {
  const [showMore, setShowMore] = useState(determineStartState(sportsGroup));
  const {
    actions: { setModal },
  } = useAppStatusStore();
  const location = useLocation();
  const history = useHistory();
  if (loading) {
    return <LoadingCard />;
  }
  // TODO: do this better when i have any idea of how this will work...
  // for now just grab the first market for major stats.
  const { type, markets } = sportsGroup;
  const isFutures = type === FUTURES;
  const market = markets[0];
  const { categories, reportingState, endTimeFormatted } = market;
  const displayableMarkets = markets.reduce(reduceToUniquePools, []);
  const numExtraWagers =
    type === COMBO
      ? displayableMarkets.length - 7
      : displayableMarkets.length - 4;
  const showMoreButtonVisible = !isFutures && numExtraWagers > 0;
  const headerType =
    location.pathname === makePath(DISPUTING)
      ? HEADER_TYPE.H2
      : location.pathname === makePath(MARKETS)
      ? HEADER_TYPE.H3
      : undefined;

  const moreWagersText = `More Wagers (${numExtraWagers})`;
  const oneOrMoreExtraWagers = numExtraWagers >= 1;

  return (
    <div
      className={classNames(Styles.SportsMarketCard, {
        [Styles.ShowMore]: showMore,
      })}
    >
      <TopRow
        market={market}
        showStart={type !== FUTURES}
        categoriesWithClick={getCategoriesWithClick(categories, history)}
      />
      <MarketTitle id={market.id} headerType={headerType} />
      <SportsGroupMarkets sportsGroup={sportsGroup} />
      {!isFutures && (
        <article className={classNames({
          [Styles.ComboFooter]: type === COMBO,
          [Styles.ExtraWagersPositioning]: oneOrMoreExtraWagers
        })}>
          {showMoreButtonVisible && oneOrMoreExtraWagers && (
            <button
              className={Styles.showMoreButton}
              onClick={() => setShowMore(!showMore)}
            >
              {ThickChevron} {`${showMore ? 'Show Less' : moreWagersText}`}
            </button>
          )}
          <button
            className={Styles.RulesButton}
            onClick={() =>
              setModal({
                type: MODAL_MARKET_RULES,
                sportMarkets: sportsGroup.markets,
                description: market.sportsBook.header,
                endTime: endTimeFormatted.formattedUtc,
              })
            }
          >
            {Rules} Rules
          </button>
          <CountdownProgress
            label="Estimated Start Time"
            time={formatTime(Number(market.sportsBook.estTimestamp))}
            reportingState={reportingState}
          />
        </article>
      )}
    </div>
  );
};

export default SportsMarketCard;
