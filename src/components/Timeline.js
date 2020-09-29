import React from 'react';
import Tweet from './Tweet';

export default ({ tweets }) => (
  <div>
    <br />
    <h3 className="center">Your Timeline</h3>
    <ul className="dashbord-list">
      {tweets.map((tweet) => (
        <li key={tweet.id}>
          <Tweet tweet={tweet} />
        </li>
      ))}
    </ul>
  </div>
);
