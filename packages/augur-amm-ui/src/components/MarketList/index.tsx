import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useDarkModeManager } from '../../contexts/LocalStorage'
import { formattedNum, getDisplayLiquidity } from '../../utils'
import { useMedia } from 'react-use'
import { withRouter } from 'react-router-dom'
import { TYPE } from '../../Theme'
import { BasicLink } from '../Link'
import { RowFixed } from '../Row'
import { getCashInfo } from '../../contexts/Application'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 4em;
`

const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.primary1};
  opacity: ${faded => (faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const MarketCardTop = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding: 2rem 2rem 0 2rem;

  > div:first-of-type {
    width: 40px;
    height: 40px;
    margin: 0 4rem 0 0;
  }

  > div:last-of-type {
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const MarketCardBottom = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 1rem;

  > div:first-of-type {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    > div:last-of-type {
      padding: 0.25rem;
      font-weight: bold;
    }
  }

  > div:nth-of-type(2) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  > div:last-of-type {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`

function groupByThree([a,b,c,...rest]){
  if (rest.length === 0) return [[a,b,c].filter(x => x!==undefined)]
  // tslint:disable-next-line: ban-ts-ignore
  // @ts-ignore
  return [[a,b,c]].concat(groupByThree(rest))
}

function MarketList({ markets, itemMax = 15 }) {
  // page state
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const [darkMode] = useDarkModeManager()

  // sorting
  const [filteredList, setFilteredList] = useState(markets)
  const below1196 = useMedia('(max-width: 1196px)')

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [])

  useEffect(() => {
    if (markets) {
      let extraPages = 1
      if (markets.length % itemMax === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(markets.length / itemMax) + extraPages)
    }
    setPage(1)
  }, [markets, itemMax])

  useEffect(() => {
    const filteredMarkets = markets
      .slice(itemMax * (page - 1), page * itemMax)
    setFilteredList(filteredMarkets)
  }, [markets, itemMax, page])


  const marketsGroupByThree = groupByThree(filteredList)

  if (!marketsGroupByThree) {
    return (null);
  }

  const marketCard = (marketData, index) => {
    const cashtoken = getCashInfo(marketData.cash)

    const cardImageSource = cashtoken
    ? <img style={{ borderRadius: '50%' }} width='40px' height='40px' alt='Token Logo' src={require(`../../assets/${cashtoken.asset}`)} />
    : <img style={{ borderRadius: '50%' }} width='40px' height='40px' alt='Token Logo' src={require('../../assets/market.png')} />;

    return (
      <TYPE.boxed m='1.5rem' key={index} style={below1196 ? {
        background: darkMode ? 'none' : 'rgba(255,255,255,0.4)',
        boxShadow: '0 3px 11px rgba(0,0,0,.04)',
        position: 'relative',
      } : {
        height: '225px',
        width: '385px',
        maxHeight: '225px',
        maxWidth: '385px',
        background: darkMode ? 'none' : 'rgba(255,255,255,0.4)',
        boxShadow: '0 3px 11px rgba(0,0,0,.04)',
        position: 'relative',
      }}>
        <BasicLink style={{
          width: '100%',
          fontWeight: '400',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }} to={'/market/' + marketData?.id} key={marketData?.id}>

        <MarketCardTop>
          <div>{cardImageSource}</div>
          <div style={{
            fontSize: '9px',
            width: '100%',
            textAlign: 'right'
          }}>
            {`${marketData.categories[0]} ${marketData.categories[1] ? '- ' + marketData.categories[1] : '' }${marketData.categories[2] ? ' - ' + marketData.categories[2] : '' }`.toUpperCase()}
          </div>
        </MarketCardTop>

        <div style={{
            margin: '1rem 2rem 0 2rem',
            textAlign: 'left',
          }}>{marketData?.description}</div>

        <MarketCardBottom>
            <div>
              <div>Liquidity</div>
              <div>{getDisplayLiquidity(marketData?.amm)}</div>
            </div>

            <div>
              <div>Yes</div>
              <div style={{
                color: darkMode ? 'rgb(125, 255, 168)' : '#2172E5',
                padding: '0.25rem',
                fontWeight: 'bold'
              }}>{formattedNum(marketData?.amm?.priceYes.toFixed(2))}</div>
            </div>

            <div>
              <div>No</div>
              <div style={{
                color: darkMode ? 'rgb(125, 255, 168)' : '#2172E5',
                padding: '0.25rem',
                fontWeight: 'bold' }}>{formattedNum(marketData?.amm?.priceNo.toFixed(2))}</div>
            </div>
          </MarketCardBottom>
        </BasicLink>
      </TYPE.boxed>
    );
  };
  return (
    <div>
      {marketsGroupByThree[0].length > 0 ? marketsGroupByThree.map((filteredList, index) => (
        <RowFixed
          key={index}
          style={
            below1196 ? {
              flexFlow: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-start'
            } : {
              flexFlow: 'row',
              justifyContent: 'center'
          }}
        >
          {filteredList.map((market, index) => marketCard(market, index))}
        </RowFixed>
      )) :
      <div style={{ fontSize: '16px', margin: '156px 0', textAlign: 'center' }}>
        No Markets
      </div>
    }

    {marketsGroupByThree[0].length > 0  &&
      <PageButtons>
        <div onClick={() => setPage(page === 1 ? page : page - 1)}>
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        <TYPE.body>{'Page ' + page + ' of ' + maxPage}</TYPE.body>
        <div onClick={() => setPage(page === maxPage ? page : page + 1)}>
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    }
    </div>
  )
}

export default withRouter(MarketList)