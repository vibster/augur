import React, { useState } from 'react';
import Styles from './activity.styles.less';
import { useAppStatusStore } from '../stores/app-status';
import { ActivityItem } from '../types';
import { ReceiptLink } from '../routes/helpers/links';
import { Pagination, sliceByPage } from '../common/pagination';
import { getCashFormat } from '../../utils/format-number';

const ActivityCard = ({ activity }: { activity: ActivityItem }) => (
  <div className={Styles.ActivityCard}>
    <div>{activity.type}</div>
    <div>{activity.value}</div>
    <div>{getCashFormat(activity.currency).icon}</div>
    <span>{activity.description}</span>
    <div>{activity.subheader}</div>
    <div>{activity.time}</div>
    <ReceiptLink hash={activity.txHash} />
  </div>
);

const ACTIVITY_PAGE_LIMIT = 10;
export const Activity = () => {
  const {
    isLogged,
    userInfo: { activity },
  } = useAppStatusStore();
  const [page, setPage] = useState(1);
  return (
    <div className={Styles.Activity}>
      <span>your activity</span>
      {isLogged && activity.length > 0 ? (
        <>
          <div>
            {sliceByPage(activity, page, ACTIVITY_PAGE_LIMIT).map(
              (activityGroup) => (
                <div key={activityGroup.date}>
                  <span>{activityGroup.date}</span>
                  <div>
                    {activityGroup.activity.map((activityItem) => (
                      <ActivityCard
                        key={activityItem.id}
                        activity={activityItem}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
          <Pagination
            page={page}
            itemCount={activity.length}
            itemsPerPage={ACTIVITY_PAGE_LIMIT}
            action={(page) => setPage(page)}
            updateLimit={() => null}
          />
        </>
      ) : (
        <span>No activity to show</span>
      )}
    </div>
  );
};
export default Activity;
